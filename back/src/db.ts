import * as fs from 'node:fs/promises';


export const db = new Map();
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
        const newDb = JSON.parse(await fs.readFile(dbFileName, 'utf8'));
        db.clear();
        Object.entries(newDb).forEach(([key, value]) => {
            db.set(key, value);
        });
    }
};

const saveDb = async () => {
    await fs.writeFile(dbTmpFileName, JSON.stringify(Object.fromEntries(db.entries())), 'utf8');
    await fs.rm(dbFileName, {force: true});
    await fs.rename(dbTmpFileName, dbFileName);
};

await readDb();

const schedule = async () => {
    await saveDb();
    setTimeout(schedule, 5000);
};

schedule();
