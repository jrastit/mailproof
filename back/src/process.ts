import {FetchMessageObject} from 'imapflow';
import {db} from './db';
import {log} from './log';
import {OpenAI} from 'openai';
import {RunnableToolFunction} from 'openai/lib/RunnableFunction';
import {ChatCompletionMessageParam} from 'openai/resources/chat';
import * as fs from 'node:fs/promises';

const model = 'gpt-4.1-mini';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const processMail = async (
    mail: FetchMessageObject,
    sendEmailBack: (sourceEmail: FetchMessageObject, text: string, html: string) => Promise<void>,
) => {
    log('Received message', {
        envelope: mail.envelope,
    });

    db.set(mail.uid, mail.envelope);

    const assistantPrompt = await fs.readFile(`prompt/prompt.txt`, 'utf-8');

    const sendEmail = async ({text, html}: { text: string, html: string }) => {
        log('Answering', {text, html});
        await sendEmailBack(mail, text, html);
        return 'OK';
    };

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
                    },
                },
                function: sendEmail,
                parse: JSON.parse,
            },
        } as RunnableToolFunction<{ text: string, html: string }>,
    ];

    const messages: ChatCompletionMessageParam[] = [
        {
            role: 'system',
            content: assistantPrompt,
        },
        {
            role: 'user',
            content: mail.source?.toString() ?? '',
        },
    ];

    try {
        await openai.chat.completions.runTools({
            model,
            tools,
            messages,
        }).finalChatCompletion();
    } catch (error) {
        log('OpenAI error', {error})
    }
};
