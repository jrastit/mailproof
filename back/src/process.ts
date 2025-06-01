import {FetchMessageObject} from 'imapflow';
import {getDB} from './db';
import {log} from './log';
import {simpleParser} from 'mailparser';
import {OpenAI} from 'openai';
import {RunnableToolFunction} from 'openai/lib/RunnableFunction';
import {ChatCompletionMessageParam} from 'openai/resources/chat';
import {createHash} from 'node:crypto';
import * as fs from 'node:fs/promises';
import {sendEmail} from './sendEmail';
import {v4 as uuid} from 'uuid';
import {verify} from 'dkim';
import {promisify} from 'node:util';


type HashEntry = {
    step: 'answered' | 'validating' | 'stacking',
    code: string,
    from: string,
    to: string,
    subject: string,
    messageId: string,
    verifyProof?: unknown,
    dkimValid: boolean,
    attachment?: string,
    answer?: {
        text: string,
        html: string,
        isSpam: boolean,
    },
};

type EmailEntry = {
    stacked: number,
    spent: number,
};

const hashDb = getDB<HashEntry>();
export const paymentDb = getDB<EmailEntry>();

const verifyDKIM = promisify(verify);

const model = 'gpt-4.1-mini';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const extractAttachment = async (mail: Buffer | string) => {
    const parsed = await simpleParser(mail);
    return parsed.attachments[0]?.content;
};

const hashContent = (data: Buffer | string) => createHash('sha256').update(data).digest('hex');

const evaluateByChat = async (mailData: string) => {
    let sendEmailData: { text: string, html: string, isSpam: boolean } | undefined;
    const assistantPrompt = await fs.readFile(`prompt/prompt.txt`, 'utf-8');

    const tools: RunnableToolFunction<any>[] = [
        {
            type: 'function',
            function: {
                name: 'sendEmail',
                description: 'send an email',
                parameters: {
                    type: 'object',
                    properties: {
                        text: {type: 'string', description: 'Email body in raw text'},
                        html: {type: 'string', description: 'Email body in HTML'},
                        isSpam: {type: 'boolean', description: 'If true email should be considered as spam'},
                    },
                },
                function: (params) => {
                    sendEmailData = params;
                    return 'OK';
                },
                parse: JSON.parse,
            },
        } as RunnableToolFunction<{ text: string, html: string, isSpam: boolean }>,
    ];

    const messages: ChatCompletionMessageParam[] = [{
        role: 'system', content: assistantPrompt,
    }, {
        role: 'user', content: mailData,
    }];

    try {
        await openai.chat.completions.runTools({
            model,
            tools,
            messages,
        }).finalChatCompletion();
    } catch (error) {
        log('OpenAI error', {error});
        throw error;
    }

    if (!sendEmailData) {
        throw new Error('sendEmailData not called');
    }

    return sendEmailData;
}

export const processMail = async (mail: FetchMessageObject) => {
    log('Received message', {
        envelope: mail.envelope,
    });

    const mailMeta = {
        from: mail.envelope?.from?.[0].address ?? '',
        to: mail.envelope?.to?.[0].address ?? '',
        subject: `Re: ${mail.envelope?.subject ?? ''}`,
        messageId: mail.envelope?.messageId ?? '',
    }

    const sendEmailBack = async (text: string, html: string) => {
        await sendEmail(
            mailMeta.to,
            mailMeta.from,
            `Re: ${mailMeta.subject}`,
            mailMeta.messageId,
            text,
            html,
        );
    };

    const attachment = await extractAttachment(mail.source ?? '');
    if (!attachment) {
        await sendEmailBack(
            'You must forward email to analyze by attachment',
            'You must forward email to analyze by attachment',
        );
        return;
    }

    const attachmentHash = `0x${hashContent(attachment)}`;
//    const dkimResults = await verifyDKIM(attachment);
//    log('DKIM', {dkimResults});
    const dkimValid = false;
    const parsedAttachment = await simpleParser(attachment);
    log('Attachment', {size: attachment.length, attachmentHash});

    const entry = hashDb.get(`hash:${attachmentHash}`);
    if (entry) {
        log('Answer already exists');
        await sendEmailBack(entry.answer?.text ?? '', entry.answer?.html ?? '');
    } else {
        const paymentKey = `email:${mailMeta.from}`;
        const paymentEntry = paymentDb.get(paymentKey);
        if (!paymentEntry || paymentEntry.stacked - paymentEntry.spent < 0.1) {
            hashDb.set(`hash:${attachmentHash}`, {
                step: 'stacking',
                code: 'none',
                attachment: attachment.toString(),
                dkimValid,
                ...mailMeta,
            });
            const path = `/pay/${encodeURIComponent(mailMeta.from)}`;
            const url = `https://worldcoin.org/mini-app?app_id=app_d574953a1565443400d391a6822124e7&path=${path}`;
            await sendEmail(
                'payment@mailproof.net',
                mailMeta.from,
                `Re: ${mailMeta.subject}`,
                mailMeta.messageId,
                `Insufficient funds, please stack using Worldcoin by going to ${url}`,
                `Insufficient funds, please stack using <a href="${url}">Worldcoin</a>`,
            );
            return;
        }
        paymentEntry.spent += 0.01;

        const data = await evaluateByChat(attachment.toString());
        if (data.isSpam) {
            log('Mail is a spam');
            hashDb.set(`hash:${attachmentHash}`, {
                step: 'answered',
                code: 'none',
                dkimValid,
                ...mailMeta,
                answer: data
            });
            await sendEmailBack(data.text, data.html);
        } else {
            const sender = parsedAttachment.from?.value[0]?.address ?? '';
            const messageId = parsedAttachment.messageId;
            const subject = parsedAttachment.subject ?? '';
            log('Mail is not a spam, asking confirmation to original sender', {sender, messageId});

            // need to send email to alice
            const code = uuid();
            hashDb.set(`hash:${attachmentHash}`, {
                step: 'validating',
                code,
                dkimValid,
                ...mailMeta,
            });
            const path = `/validate/${attachmentHash}/${code}`;
            const url = `https://worldcoin.org/mini-app?app_id=app_d574953a1565443400d391a6822124e7&path=${path}`;
            await sendEmail(
                'validation@mailproof.net',
                sender,
                `Re: ${subject}`,
                messageId,
                `Please validate using Worldcoin by going to ${url}`,
                `Please validate using <a href="${url}">Worldcoin</a>`,
            );
        }
    }
};

export const resumePending = async (email: string) => {
    hashDb.forEach(async (entry, attachmentHash) => {
        if (entry.from === email && entry.step === 'stacking') {
            const paymentKey = `email:${entry.from}`;
            const paymentEntry = paymentDb.get(paymentKey);
            if (!paymentEntry || paymentEntry.stacked - paymentEntry.spent < 0.1) {
                const path = `/pay/${encodeURIComponent(entry.from)}`;
                const url = `https://worldcoin.org/mini-app?app_id=app_d574953a1565443400d391a6822124e7&path=${path}`;
                await sendEmail(
                    'payment@mailproof.net',
                    entry.from,
                    `Re: ${entry.subject}`,
                    entry.messageId,
                    `Insufficient funds, please stack using Worldcoin by going to ${url}`,
                    `Insufficient funds, please stack using <a href="${url}">Worldcoin</a>`,
                );
                return;
            }
            paymentEntry.spent += 0.01;

            const sendEmailBack = async (text: string, html: string) => {
                await sendEmail(
                    entry.to,
                    entry.from,
                    `Re: ${entry.subject}`,
                    entry.messageId,
                    text,
                    html,
                );
            };

            const data = await evaluateByChat(entry.attachment ?? '');
            if (data.isSpam) {
                log('Mail is a spam');
                entry.step = 'answered';
                entry.answer = data;
                await sendEmailBack(data.text, data.html);
            } else {
                const parsedAttachment = await simpleParser(entry.attachment ?? '');
                const sender = parsedAttachment.from?.value[0]?.address ?? '';
                const messageId = parsedAttachment.messageId;
                const subject = parsedAttachment.subject ?? '';
                log('Mail is not a spam, asking confirmation to original sender', {sender, messageId});

                // need to send email to alice
                const code = uuid();
                entry.step = 'validating';
                entry.code = code;

                const path = `/validate/${attachmentHash}/${code}`;
                const url = `https://worldcoin.org/mini-app?app_id=app_d574953a1565443400d391a6822124e7&path=${path}`;
                await sendEmail(
                    'validation@mailproof.net',
                    sender,
                    `Re: ${subject}`,
                    messageId,
                    `Hi, To verify your identity, we invite you to use Worldcoin.
Please validate by going to: ${url}`,
                    `Please validate using <a href="${url}">Worldcoin</a> This step is necessary to ensure the security of your information.
Thank you for your cooperation.`,
                );
            }
        }
    });
};

export const processWorldcoinValidation = async (
    {
        verifyRes,
        proof,
        validate_hash,
        validate_code,
    }: {
        verifyRes: { success: boolean },
        proof: any,
        validate_hash: string,
        validate_code: string
    }
) => {
    const entry = hashDb.get(`hash:${validate_hash}`);
    if (entry && entry.step === 'validating' && entry.code === validate_code && verifyRes.success) {
        entry.step = 'answered';
        entry.verifyProof = proof;
        const url = `https://mini.app.mailproof.net/check/${validate_hash}`;
        await sendEmail(
            entry.to,
            entry.from,
            `Re: ${entry.subject}`,
            entry.messageId,
            `Sender has validated email. See on-chain proof ${url}`,
            `Sender has validated email. See <a href="${url}">on-chain proof</a>`,
        );
        return {success: true};
    } else {
        return {success: false};
    }
};

export const processValidationCheck = async ({validate_hash}: { validate_hash: string }) => {
    const entry = hashDb.get(`hash:${validate_hash}`);
    if (entry && entry.step === 'answered') {
        return {
            verified: true,
            proof: entry.verifyProof,
        };
    } else {
        return {
            verified: false,
        };
    }
};