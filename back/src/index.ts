import {ImapFlow} from 'imapflow';
import {listen} from "./listen";
import {processMail} from "./process";


const client = new ImapFlow({
    host: 'imap.ionos.fr',
    port: 993,
    secure: true,
    auth: {
        user: '*@mailproof.net',
        pass: process.env.MAIL_PASSWORD
    },
    logger: false,
});

await listen(client, 'INBOX', processMail);

