import {listen} from './listen';
import {processMail} from './process';
import './server';

await listen(['INBOX', 'Spam'], processMail);

