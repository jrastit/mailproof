import * as fs from 'node:fs/promises';

export type DbEntry = {
    step: 'answered' | 'validating',
    code: string,
    from: string,
    to: string,
    subject: string,
    messageId: string,
    verifyRes?: string,
    answer?: {
        text: string,
        html: string,
    },
};

export const db = new Map<string, DbEntry>();
const dbFileName = 'db.json';
const dbTmpFileName = 'db.tmp.json';

const exists = async (name: string) => {
    try {
        await fs.access(name);
        return true;
    } catch {
        return false;
    }
};

const readDb = async () => {
    if (await exists(dbTmpFileName)) {
        if (await exists(dbFileName)) {
            await fs.rm(dbTmpFileName, {force: true});
        } else {
            await fs.rename(dbTmpFileName, dbFileName);
        }
    }

    if (await exists(dbFileName)) {
        const newDb: Record<string, DbEntry> = JSON.parse(await fs.readFile(dbFileName, 'utf8'));
        db.clear();
        Object.entries(newDb).forEach(([key, value]) => {
            db.set(key, value);
        });
    }
};

const saveDb = async () => {
    await fs.writeFile(dbTmpFileName, JSON.stringify(Object.fromEntries(db.entries()), undefined, 2), 'utf8');
    await fs.rm(dbFileName, {force: true});
    await fs.rename(dbTmpFileName, dbFileName);
};

await readDb();

const schedule = async () => {
    await saveDb();
    setTimeout(schedule, 5000);
};

schedule();
