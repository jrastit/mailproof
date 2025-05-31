import nodemailer from 'nodemailer';
import {log} from './log';

const transporter = nodemailer.createTransport({
    host: 'smtp.ionos.fr',
    port: 465,
    secure: true,
    auth: {
        user: '*@mailproof.net',
        pass: process.env.MAIL_PASSWORD
    },
});

export const sendEmail = async (
    from: string,
    to: string,
    subject: string,
    inReplyTo: string | undefined,
    text: string,
    html: string,
) => {
    const info = await transporter.sendMail({
        from,
        to,
        subject,
        inReplyTo,
        text,
        html,
    });
    log('Email sent:', {messageId: info.messageId});
};
