import { Request, Response, NextFunction } from 'express';
import { getDb } from '../db.js';
import { config } from '../config.js';

export const checkSubscription = async (req: Request, res: Response, next: NextFunction) => {
    if (config.LOCAL_MODE && config.NODE_ENV !== 'test') {
        return next();
    }
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    try {
        const db = await getDb();
        const user = await db.get(
            'SELECT subscription_status, trial_expires_at FROM users WHERE id = ?',
            [userId]
        );

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        const now = new Date();
        const trialExpires = user.trial_expires_at ? new Date(user.trial_expires_at) : null;
        const isTrialActive = trialExpires && trialExpires > now;
        const isSubscribed = user.subscription_status === 'active';

        if (!isSubscribed && !isTrialActive) {
            return res.status(403).json({
                error: 'Assinatura necessária.',
                requiresSubscription: true
            });
        }

        next();
    } catch (error) {
        console.error('Error in checkSubscription middleware:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
