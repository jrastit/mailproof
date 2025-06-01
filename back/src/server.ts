import bodyParser from 'body-parser';
import express from 'express';
import {log} from './log';
import {paymentDb, processValidationCheck, processWorldcoinValidation, resumePending} from './process';

const port = 8080;
const app = express();

app.use('/api', bodyParser.json());

app.post('/api/worldcoin', async (req, res) => {
    const result = await processWorldcoinValidation(req.body);
    res.json(result);
});

app.get('/api/check', async (req, res) => {
    const result = await processValidationCheck(req.query as any);
    res.json(result);
});

app.post('/api/payment/stack', async (req, res) => {
    const {email, amount} = req.body;
    const realAmount = Number.parseInt(amount.substring(0, amount.length - 16)) / 100;
    const key = `email:${email}`;
    const entry = paymentDb.get(key);
    if (entry) {
        entry.stacked += realAmount;
    } else {
        paymentDb.set(key, {stacked: realAmount, spent: 0});
    }
    resumePending(email);
    res.json({success: true});
});

app.get('/api/payment/balance', async (req, res) => {
    const {email} = req.query as any;
    const key = `email:${email}`;
    const entry = paymentDb.get(key);
    res.json({stacked: entry?.stacked ?? 0, spent: entry?.spent ?? 0});
});

app.listen(port, () => log('Ready to process request', {port}));
