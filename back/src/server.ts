import bodyParser from 'body-parser';
import express from 'express';
import {log} from './log';
import {processWorldcoinValidation} from './process';

const port = 8080;
const app = express();

app.use('/api', bodyParser.json());
app.post('/api/worldcoin', async (req, res) => {
    const success = await processWorldcoinValidation(req.body);
    res.json({success});
});

app.listen(port, () => log('Ready to process request', {port}));
