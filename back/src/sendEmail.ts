import nodemailer from 'nodemailer';
import {log} from './log';
import {FetchMessageObject} from "imapflow";

const transporter = nodemailer.createTransport({
    host: 'smtp.ionos.fr',
    port: 465,
    secure: true,
    auth: {
        user: '*@mailproof.net',
        pass: process.env.MAIL_PASSWORD
    },
});

export const sendEmailBack = async (sourceEmail: FetchMessageObject, text: string, html: string) => {
    const info = await transporter.sendMail({
        from: sourceEmail.envelope?.to?.[0].address,
        to: sourceEmail.envelope?.from?.[0].address,
        subject: `Re: ${sourceEmail.envelope?.subject ?? ''}`,
        text,
        html,
        inReplyTo: sourceEmail.envelope?.messageId,
    });
    log('Email sent:', {messageId: info.messageId});
};
