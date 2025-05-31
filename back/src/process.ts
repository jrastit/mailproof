import {FetchMessageObject} from "imapflow";
import {log} from "./log";
import {OpenAI} from 'openai';
import {RunnableToolFunction} from 'openai/lib/RunnableFunction';
import {ChatCompletionMessageParam} from 'openai/resources/chat';
import * as fs from 'node:fs/promises';

const model = 'gpt-4-1106-preview';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const processMail = async (mail: FetchMessageObject) => {
    log('Received message', {
        envelope: mail.envelope,
    });

    const assistantPrompt = await fs.readFile(`prompt/prompt.txt`, 'utf-8');

    const sendEmail = ({body}: { body: string }) => {
        log('Answering', {body});
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
                        body: {type: 'string'},
                    },
                },
                function: sendEmail,
                parse: JSON.parse,
            },
        } as RunnableToolFunction<{ body: string }>,
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
