import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authenticateToken } from '../middleware/authMiddleware.js';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

vi.mock('jsonwebtoken');

describe('authMiddleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;

    beforeEach(() => {
        mockRequest = {
            headers: {}
        };
        mockResponse = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };
        nextFunction = vi.fn();
    });

    it('should return 401 if no authorization header is present', () => {
        authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Acesso negado. Token não fornecido.' });
    });

    it('should return 401 if token is poorly formatted', () => {
        mockRequest.headers = { authorization: 'Bearer' };
        authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Acesso negado. Token não fornecido.' });
    });

    it('should return 403 if token is invalid or expired', () => {
        mockRequest.headers = { authorization: 'Bearer invalid_token' };
        vi.mocked(jwt.verify).mockImplementation((token, secret, cb) => {
            if (cb) (cb as any)(new Error('Invalid token'), undefined);
            return undefined as any;
        });

        authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);
        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Token inválido ou expirado.' });
    });

    it('should call next and attach userId/email if token is valid', () => {
        mockRequest.headers = { authorization: 'Bearer valid_token' };
        const mockPayload = { userId: 123, email: 'test@example.com' };

        vi.mocked(jwt.verify).mockImplementation((token, secret, cb) => {
            if (cb) (cb as any)(null, mockPayload);
            return mockPayload as any;
        });

        authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);
        expect(nextFunction).toHaveBeenCalled();
        expect((mockRequest as any).userId).toBe(123);
        expect((mockRequest as any).user.email).toBe('test@example.com');
    });
});
