import {FetchMessageObject, ImapFlow} from 'imapflow';
import ResolvablePromise from 'resolvable-promise';
import {log} from "./log";

let running = true;

export const stopListening = () => {
    running = false;
}

export const listen = async (client: ImapFlow, mailboxName: string, process: (message: FetchMessageObject) => Promise<void>) => {
    let existEventPromise = new ResolvablePromise();
    client.on('exists', (updateEvent) => {
        log('update event', {updateEvent});
        existEventPromise.resolve();
        existEventPromise = new ResolvablePromise();
    })

    log('Connection client...');
    await client.connect();

    log('Opening mailbox...');
    const mailbox = await client.mailboxOpen(mailboxName);

    log('Fetching messages...');
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

    log('Stopping...');
    await client.logout();
}