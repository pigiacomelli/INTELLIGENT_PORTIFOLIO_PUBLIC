import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db.js';
import { config } from '../config.js';

const SECRET = config.JWT_SECRET;

export class AuthService {
    async registerUser(email: string, passwordRaw: string) {
        const db = await getDb();

        // Verifica se usuário já existe (primeiro roundtrip ainda é necessário para lógica de erro clara)
        const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser) {
            throw new Error('E-mail já está em uso.');
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(passwordRaw, salt);

        // Define trial for 30 days
        const trialExpiresAt = new Date();
        trialExpiresAt.setDate(trialExpiresAt.getDate() + config.TRIAL_DAYS);

        // Otimização: Inserção do usuário e do grupo de portfólio em uma única query atômica
        const query = `
            WITH new_user AS (
                INSERT INTO users (email, password_hash, subscription_status, subscription_plan, trial_expires_at)
                VALUES (?, ?, ?, ?, ?)
                RETURNING id, email, subscription_status, trial_expires_at
            ),
            new_group AS (
                INSERT INTO portfolio_groups (user_id, name)
                SELECT id, 'Minha Carteira' FROM new_user
            )
            SELECT * FROM new_user;
        `;

        const result = await db.get(query, [email, passwordHash, 'trial', 'free', trialExpiresAt]);
        const user = {
            id: result.id,
            email: result.email,
            subscription_status: result.subscription_status,
            subscription_plan: 'free',
            trial_expires_at: result.trial_expires_at
        };

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            SECRET,
            { expiresIn: '30d' }
        );

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                subscriptionStatus: user.subscription_status,
                subscriptionPlan: user.subscription_plan,
                trialExpiresAt: user.trial_expires_at
            }
        };
    }

    async loginUser(email: string, passwordRaw: string) {
        const db = await getDb();

        const user = await db.get(
            'SELECT id, email, password_hash, subscription_status, subscription_plan, trial_expires_at FROM users WHERE email = ?',
            [email]
        );
        if (!user) {
            throw new Error('Credenciais inválidas.');
        }

        const isMatch = await bcrypt.compare(passwordRaw, user.password_hash);
        if (!isMatch) {
            throw new Error('Credenciais inválidas.');
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            SECRET,
            { expiresIn: '30d' } // Token expira em 30 dias
        );

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                subscriptionStatus: user.subscription_status,
                subscriptionPlan: user.subscription_plan,
                trialExpiresAt: user.trial_expires_at
            }
        };
    }

    async getUserById(userId: number) {
        const db = await getDb();
        const user = await db.get(
            'SELECT id, email, subscription_status, subscription_plan, trial_expires_at FROM users WHERE id = ?',
            [userId]
        );
        if (!user) {
            throw new Error('Usuário não encontrado.');
        }

        return {
            id: user.id,
            email: user.email,
            subscriptionStatus: user.subscription_status,
            subscriptionPlan: user.subscription_plan,
            trialExpiresAt: user.trial_expires_at
        };
    }

    async deleteAccount(userId: number) {
        const db = await getDb();
        // A Exclusão física (Hard Delete) assegura o "Direito ao Esquecimento" da LGPD.
        await db.run('DELETE FROM portfolios WHERE user_id = ?', [userId]);
        await db.run('DELETE FROM portfolio_groups WHERE user_id = ?', [userId]);
        await db.run('DELETE FROM transactions WHERE user_id = ?', [userId]);
        await db.run('DELETE FROM public_portfolios WHERE user_id = ?', [userId]);

        await db.run('DELETE FROM users WHERE id = ?', [userId]);
        return { success: true, message: "Conta e dados excluídos com sucesso." };
    }
}
