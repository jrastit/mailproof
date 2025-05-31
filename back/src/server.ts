import bodyParser from 'body-parser';
import express from 'express';
import {log} from './log';
import {processValidationCheck, processWorldcoinValidation} from './process';

const port = 8080;
const app = express();

app.use('/api', bodyParser.json());

app.post('/api/worldcoin', async (req, res) => {
    const result = await processWorldcoinValidation(req.body);
    res.json(result);
});

app.get('/api/check', async (req, res) => {
    const result = await processValidationCheck(req.params as any);
    res.json(result);
});

app.listen(port, () => log('Ready to process request', {port}));
