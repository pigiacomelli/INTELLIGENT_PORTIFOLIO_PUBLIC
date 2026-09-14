import { AsyncLocalStorage } from 'async_hooks';

export const requestContext = new AsyncLocalStorage<Map<string, string>>();

const formatMessage = (level: 'info' | 'warn' | 'error' | 'fatal', message: string, meta?: any) => {
    const store = requestContext.getStore();
    const requestId = store?.get('requestId') || 'system';
    const userId = store?.get('userId');

    return JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        requestId,
        ...(userId ? { userId } : {}),
        message,
        ...meta
    });
};

export const logger = {
    info: (message: string, meta?: any) => console.log(formatMessage('info', message, meta)),
    warn: (message: string, meta?: any) => console.warn(formatMessage('warn', message, meta)),
    error: (message: string, meta?: any) => console.error(formatMessage('error', message, meta)),
    fatal: (message: string, meta?: any) => console.error(formatMessage('fatal', message, meta)),
};
