import {ImapFlow } from 'imapflow';

let running = true;

const main = async () => {
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

    client.on('exists', (updateEvent) => {
        console.log('update event');
        console.log(updateEvent);
    })

    console.log('connecting...');
    await client.connect();
    console.log('connected !');

    const mailbox = await client.mailboxOpen('INBOX');

    console.log(mailbox.exists);

    while (running) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log('disconnecting');

    // log out and close connection
    await client.logout();
};

try {
    await main();
} catch (err) {
    console.error(err);
}
