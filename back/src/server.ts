import bodyParser from 'body-parser';
import express from 'express';
import {log} from "./log";

const port = 8080;
const app = express();

app.use('/api', bodyParser.json());
app.post('/api/worldcoin', (req, res) => {
    res.json({success: true});
});

app.listen(port, () => log('Ready to process request', {port}));
