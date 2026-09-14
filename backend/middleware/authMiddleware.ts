import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { requestContext } from '../utils/logger.js';
import { config } from '../config.js';

const JWT_SECRET = config.JWT_SECRET;

// Extend Express Request interface to include user data
declare module 'express-serve-static-core' {
    interface Request {
        userId?: number;
        requestId?: string;
        user?: {
            userId: number;
            email: string;
        };
    }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    }

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido ou expirado.' });
        }

        req.userId = decoded.userId;
        req.user = decoded; // Contains userId and email

        const store = requestContext.getStore();
        if (store) {
            store.set('userId', decoded.userId.toString());
        }
        next();
    });
};
