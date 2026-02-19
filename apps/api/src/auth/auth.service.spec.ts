import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Role } from '@org/data';

const mockUserRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a new user successfully', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      mockUserRepo.create.mockReturnValue({ email: 'test@test.com' });
      mockUserRepo.save.mockResolvedValue({ id: 1, email: 'test@test.com' });

      const result = await service.register('test@test.com', 'password123', Role.Viewer, 1);
      expect(result).toEqual({ message: 'User created successfully' });
      expect(mockUserRepo.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 1, email: 'test@test.com' });
      await expect(service.register('test@test.com', 'password', Role.Viewer, 1))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return access token on valid credentials', async () => {
      const hashed = await bcrypt.hash('password123', 10);
      mockUserRepo.findOne.mockResolvedValue({ id: 1, email: 'test@test.com', password: hashed, role: Role.Viewer, organizationId: 1 });

      const result = await service.login('test@test.com', 'password123');
      expect(result).toHaveProperty('access_token');
      expect(mockJwtService.sign).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException on invalid email', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      await expect(service.login('wrong@test.com', 'password'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      const hashed = await bcrypt.hash('correctpassword', 10);
      mockUserRepo.findOne.mockResolvedValue({ id: 1, password: hashed });
      await expect(service.login('test@test.com', 'wrongpassword'))
        .rejects.toThrow(UnauthorizedException);
    });
  });
});