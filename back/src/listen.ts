import {FetchMessageObject, ImapFlow} from 'imapflow';
import ResolvablePromise from 'resolvable-promise';
import {log} from './log';

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

let running = true;

export const stopListening = () => {
    running = false;
}

export const listen = async (mailboxNames: string[], process: (message: FetchMessageObject) => Promise<void>) => {
    let existEventPromise = new ResolvablePromise();
    client.on('exists', (updateEvent) => {
        log('Update event received', {updateEvent});
        existEventPromise.resolve();
        existEventPromise = new ResolvablePromise();
    });

    log('Connection client...');
    await client.connect();

    log('Opening mailbox...');
    await Promise.all(mailboxNames.map(async (mailboxName) => {
        const mailbox = await client.mailboxOpen(mailboxName);

        log('Fetching messages...', {mailboxName});
        while (running) {
            if (mailbox.exists) {
                const msg = await client.fetchOne('*', {
                    uid: true,
                    flags: true,
                    envelope: true,
                    source: true,
                });
                await client.messageDelete([msg.uid], {uid: true});
                await process(msg);
            } else {
                const waitPromise = new Promise((resolve) => setTimeout(resolve, 1000));
                await Promise.race([existEventPromise, waitPromise]);
            }
        }
    }));

    log('Stopping...');
    await client.logout();
}