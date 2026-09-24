import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
const backendDirectory = path.basename(moduleDirectory) === 'dist'
    ? path.dirname(moduleDirectory)
    : moduleDirectory;

export const databasePath = path.isAbsolute(config.DATABASE_PATH)
    ? config.DATABASE_PATH
    : path.resolve(backendDirectory, config.DATABASE_PATH);

mkdirSync(path.dirname(databasePath), { recursive: true });

const sqlite = new DatabaseSync(databasePath);
sqlite.exec('PRAGMA foreign_keys = ON');
sqlite.exec('PRAGMA journal_mode = WAL');
sqlite.exec('PRAGMA busy_timeout = 5000');

type Params = unknown[];
type TransactionDatabase = {
    run: (query: string, params?: Params) => Promise<any>;
    get: (query: string, params?: Params) => Promise<any>;
    all: (query: string, params?: Params) => Promise<any[]>;
    exec: (query: string) => Promise<void>;
};

const normalizeQuery = (query: string) => query.replace(/\$\d+/g, '?');
const normalizeParams = (params: Params): SQLInputValue[] => params.map((value) => {
    if (value instanceof Date) return value.toISOString();
    if (value === undefined) return null;
    return value as SQLInputValue;
});

const runDirect = (query: string, params: Params = []) => {
    const result = sqlite.prepare(normalizeQuery(query)).run(...normalizeParams(params));
    return {
        changes: Number(result.changes),
        lastInsertRowid: Number(result.lastInsertRowid)
    };
};

const getDirect = (query: string, params: Params = []): any => (
    sqlite.prepare(normalizeQuery(query)).get(...normalizeParams(params)) ?? null
);

const allDirect = (query: string, params: Params = []) => (
    sqlite.prepare(normalizeQuery(query)).all(...normalizeParams(params)) as any[]
);

let operationQueue: Promise<void> = Promise.resolve();

const enqueue = <T>(operation: () => T | Promise<T>): Promise<T> => {
    const pending = operationQueue.then(operation, operation);
    operationQueue = pending.then(() => undefined, () => undefined);
    return pending;
};

export async function getDb() {
    const run = (query: string, params: Params = []) => enqueue(() => runDirect(query, params));
    const get = (query: string, params: Params = []) => enqueue(() => getDirect(query, params));
    const all = (query: string, params: Params = []) => enqueue(() => allDirect(query, params));
    const exec = (query: string) => enqueue(() => sqlite.exec(query));

    const transaction = <T>(callback: (tx: TransactionDatabase) => Promise<T>): Promise<T> => enqueue(async () => {
        sqlite.exec('BEGIN IMMEDIATE');
        try {
            const result = await callback({
                run: async (query, params = []) => runDirect(query, params),
                get: async (query, params = []) => getDirect(query, params),
                all: async (query, params = []) => allDirect(query, params),
                exec: async (query) => sqlite.exec(query)
            });
            sqlite.exec('COMMIT');
            return result;
        } catch (error) {
            sqlite.exec('ROLLBACK');
            throw error;
        }
    });

    return { run, get, all, exec, transaction };
}
