import {listen} from './listen';
import {processMail} from './process';
import {sendEmailBack} from './sendEmail';

await listen((message) => processMail(message, sendEmailBack));

