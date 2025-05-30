import {FetchMessageObject} from "imapflow";
import {log} from "./log";

export const processMail = async (message: FetchMessageObject) => {
    log('Received message', {
        uid: message.uid,
        flags: message.flags,
        envelope: message.envelope,
        headers: message.headers?.toString(),
        bodyStructure: message.bodyStructure,
        bodyParts: message.bodyParts,
        source: message.source?.toString(),
    });
};
