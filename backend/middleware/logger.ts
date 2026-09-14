import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { requestContext, logger } from '../utils/logger.js';

const getRequestId = (req: Request): string => {
    const headerId = req.header('x-request-id');
    if (headerId && headerId.trim().length > 0) return headerId;
    return crypto.randomUUID();
};

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const { method, url, ip } = req;
    req.requestId = getRequestId(req);
    res.setHeader('x-request-id', req.requestId);

    res.on('finish', () => {
        const durationMs = Date.now() - start;
        const { statusCode } = res;
        logger.info('Request completed', {
            method,
            url,
            statusCode,
            durationMs,
            ip,
            userAgent: req.get('user-agent') || 'unknown'
        });

        if (statusCode >= 500) {
            logger.fatal('Critical Error 5xx detected', {
                url,
                method,
                statusCode
            });
        }
    });

    const store = new Map<string, string>();
    store.set('requestId', req.requestId);
    if (req.userId) {
        store.set('userId', req.userId.toString());
    }

    requestContext.run(store, () => {
        next();
    });
};
