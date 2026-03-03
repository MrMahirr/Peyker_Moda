import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs', () => ({
    compare: jest.fn(),
}));

describe('AuthService', () => {
    let service: AuthService;
    let usersService: UsersService;
    let jwtService: JwtService;

    const mockUser = {
        id: 'user-id-1',
        email: 'test@example.com',
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User',
        role: 'ADMIN',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockUsersService = {
        findByEmail: jest.fn(),
        findById: jest.fn(),
    };

    const mockJwtService = {
        signAsync: jest.fn(),
        verifyAsync: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UsersService, useValue: mockUsersService },
                { provide: JwtService, useValue: mockJwtService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        usersService = module.get<UsersService>(UsersService);
        jwtService = module.get<JwtService>(JwtService);

        // Reset mocks
        jest.clearAllMocks();
    });

    describe('validateUser', () => {
        it('should return user data when credentials are valid', async () => {
            mockUsersService.findByEmail.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await service.validateUser('test@example.com', 'password123');

            expect(result).toBeDefined();
            expect(result.email).toBe('test@example.com');
            expect(result.password).toBeUndefined();
        });

        it('should throw UnauthorizedException when user not found', async () => {
            mockUsersService.findByEmail.mockResolvedValue(null);

            await expect(
                service.validateUser('notfound@example.com', 'password'),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException when password is invalid', async () => {
            mockUsersService.findByEmail.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(
                service.validateUser('test@example.com', 'wrongpassword'),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException when user is inactive', async () => {
            mockUsersService.findByEmail.mockResolvedValue({ ...mockUser, isActive: false });
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            await expect(
                service.validateUser('test@example.com', 'password123'),
            ).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('login', () => {
        it('should return access token on successful login', async () => {
            const expectedToken = 'jwt-token-123';
            mockJwtService.signAsync.mockResolvedValue(expectedToken);

            const result = await service.login(mockUser);

            expect(result).toBeDefined();
            expect(result.accessToken).toBe(expectedToken);
            expect(mockJwtService.signAsync).toHaveBeenCalledWith({
                sub: mockUser.id,
                email: mockUser.email,
                role: mockUser.role,
            });
        });
    });
});
