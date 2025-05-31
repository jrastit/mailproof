import bodyParser from 'body-parser';
import express from 'express';
import {log} from './log';
import {processValidationCheck, processWorldcoinValidation} from './process';
import {getDB} from "./db";

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


type EmailEntry = {
    stacked: number,
    spent: number,
};

const db = getDB<EmailEntry>();

app.post('/api/payment/stack', async (req, res) => {
    const {email, amount} = req.body;
    const key = `email:${email}`;
    const entry = db.get(key);
    if (entry) {
        entry.stacked += amount;
    } else {
        db.set(key, {stacked: amount, spent: 0});
    }
    res.json({success: true});
});

app.post('/api/payment/spend', async (req, res) => {
    const {email, amount} = req.body;
    const key = `email:${email}`;
    const entry = db.get(key);
    if (entry && entry.stacked >= amount) {
        entry.stacked -= amount;
        res.json({success: true});
    } else {
        res.json({success: false});
    }
});

app.get('/api/payment/balance', async (req, res) => {
    const {email} = req.params as any;
    const key = `email:${email}`;
    const entry = db.get(key);
    res.json({stacked: entry?.stacked ?? 0, spent: entry?.spent ?? 0});
});

app.listen(port, () => log('Ready to process request', {port}));
