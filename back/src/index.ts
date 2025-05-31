import {listen} from './listen';
import {processMail} from './process';
import {sendEmailBack} from './sendEmail';

await listen(['INBOX', 'Spam'],(message) => processMail(message, sendEmailBack));

