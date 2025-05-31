import {FetchMessageObject} from 'imapflow';
import {db, DbEntry} from './db';
import {log} from './log';
import {simpleParser} from 'mailparser';
import {OpenAI} from 'openai';
import {RunnableToolFunction} from 'openai/lib/RunnableFunction';
import {ChatCompletionMessageParam} from 'openai/resources/chat';
import {createHash} from 'node:crypto';
import * as fs from 'node:fs/promises';
import {sendEmail} from './sendEmail';
import {v4 as uuid} from 'uuid';

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
    const parsedAttachment = await simpleParser(attachment);
    log('Attachment', {size: attachment.length, attachmentHash});

    if (db.has(attachmentHash)) {
        log('Answer already exists');
        const dbData = db.get(attachmentHash) as DbEntry;
        await sendEmailBack(dbData.answer?.text ?? '', dbData.answer?.html ?? '');
    } else {
        const data = await evaluateByChat(attachment.toString());
        if (data.isSpam) {
            log('Mail is a spam');
            db.set(attachmentHash, {
                step: 'answered',
                code: 'none',
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
            db.set(attachmentHash, {
                step: 'validating',
                code,
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

export const processWorldcoinValidation = async (
    {
        verifyRes,
        validate_hash,
        validate_code,
    }: {
        verifyRes: string,
        validate_hash: string,
        validate_code: string
    }
) => {
    const entry = db.get(validate_hash);
    if (entry && entry.step === 'validating' && entry.code === validate_code) {
        entry.verifyRes = verifyRes;
        const url = 'https://blockscoot.com/..'; // TODO
        await sendEmail(
            entry.to,
            entry.from,
            `Re: ${entry.subject}`,
            entry.messageId,
            `Sender has validated email. See on-chain proof ${url}`,
            `Sender has validated email. See <a href="${url}">on-chain proof</a>`,
        );
        return true;
    } else {
        return false;
    }
};
