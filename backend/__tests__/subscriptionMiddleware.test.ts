import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkSubscription } from '../middleware/subscriptionMiddleware.js';
import { Request, Response, NextFunction } from 'express';

// Mock DB module
vi.mock('../db.js', () => {
    return {
        getDb: vi.fn(),
    };
});
import { getDb } from '../db.js';

describe('subscriptionMiddleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };
        nextFunction = vi.fn();
        vi.clearAllMocks();
    });

    it('should return 401 if userId is missing', async () => {
        await checkSubscription(mockRequest as Request, mockResponse as Response, nextFunction);
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Usuário não autenticado.' });
    });

    it('should return 404 if user is not found in database', async () => {
        (mockRequest as any).userId = 999;

        const mockDb = { get: vi.fn().mockResolvedValue(null) };
        vi.mocked(getDb).mockResolvedValue(mockDb as any);

        await checkSubscription(mockRequest as Request, mockResponse as Response, nextFunction);
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado.' });
    });

    it('should call next if subscription is active', async () => {
        (mockRequest as any).userId = 1;

        const mockDb = { get: vi.fn().mockResolvedValue({ subscription_status: 'active', trial_expires_at: null }) };
        vi.mocked(getDb).mockResolvedValue(mockDb as any);

        await checkSubscription(mockRequest as Request, mockResponse as Response, nextFunction);
        expect(nextFunction).toHaveBeenCalled();
    });

    it('should call next if user is on active trial', async () => {
        (mockRequest as any).userId = 1;
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 5);

        const mockDb = { get: vi.fn().mockResolvedValue({ subscription_status: 'trial', trial_expires_at: futureDate }) };
        vi.mocked(getDb).mockResolvedValue(mockDb as any);

        await checkSubscription(mockRequest as Request, mockResponse as Response, nextFunction);
        expect(nextFunction).toHaveBeenCalled();
    });

    it('should return 403 if trial is expired and no active subscription', async () => {
        (mockRequest as any).userId = 1;
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 2); // Expired 2 days ago

        const mockDb = { get: vi.fn().mockResolvedValue({ subscription_status: 'inactive', trial_expires_at: pastDate }) };
        vi.mocked(getDb).mockResolvedValue(mockDb as any);

        await checkSubscription(mockRequest as Request, mockResponse as Response, nextFunction);
        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: 'Assinatura necessária.',
            requiresSubscription: true
        });
    });
});
