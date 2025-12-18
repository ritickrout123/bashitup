import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { 
  LoginCredentials, 
  UserRegistration, 
  AuthResponse, 
  JWTPayload, 
  User,
  UserRole 
} from '@/types';
import { 
  ValidationError, 
  AuthenticationError,
  DatabaseError 
} from './errors';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT secrets must be defined in environment variables');
}

export class AuthService {
  /**
   * Generate JWT access token
   */
  static async generateAccessToken(payload: JWTPayload): Promise<string> {
    const secret = new TextEncoder().encode(JWT_SECRET as string);
    const expirationTime = JWT_EXPIRES_IN === '7d' ? '7d' : JWT_EXPIRES_IN;
    
    return await new SignJWT({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(expirationTime)
      .sign(secret);
  }

  /**
   * Generate JWT refresh token
   */
  static async generateRefreshToken(payload: JWTPayload): Promise<string> {
    const secret = new TextEncoder().encode(JWT_REFRESH_SECRET as string);
    const expirationTime = JWT_REFRESH_EXPIRES_IN === '30d' ? '30d' : JWT_REFRESH_EXPIRES_IN;
    
    return await new SignJWT({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(expirationTime)
      .sign(secret);
  }

  /**
   * Verify JWT access token
   */
  static async verifyAccessToken(token: string): Promise<JWTPayload> {
    try {
      const secret = new TextEncoder().encode(JWT_SECRET as string);
      const { payload } = await jwtVerify(token, secret);
      return {
        userId: payload.userId as string,
        email: payload.email as string,
        role: payload.role as UserRole,
        iat: payload.iat,
        exp: payload.exp,
      };
    } catch {
      throw new AuthenticationError('Invalid or expired access token');
    }
  }

  /**
   * Verify JWT refresh token
   */
  static async verifyRefreshToken(token: string): Promise<JWTPayload> {
    try {
      const secret = new TextEncoder().encode(JWT_REFRESH_SECRET as string);
      const { payload } = await jwtVerify(token, secret);
      return {
        userId: payload.userId as string,
        email: payload.email as string,
        role: payload.role as UserRole,
        iat: payload.iat,
        exp: payload.exp,
      };
    } catch {
      throw new AuthenticationError('Invalid or expired refresh token');
    }
  }

  /**
   * Hash password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare password with hash
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone format (Indian format)
   */
  static validatePhone(phone: string): boolean {
    const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Register a new user
   */
  static async register(userData: UserRegistration): Promise<AuthResponse> {
    const { name, email, phone, password, role = 'CUSTOMER' } = userData;

    // Validate input data
    if (!name || name.trim().length < 2) {
      throw new ValidationError('Name must be at least 2 characters long');
    }

    if (!this.validateEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    if (!this.validatePhone(phone)) {
      throw new ValidationError('Invalid phone number format');
    }

    const passwordValidation = this.validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new ValidationError(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    try {
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: email.toLowerCase() },
            { phone: phone.replace(/\s+/g, '') }
          ]
        }
      });

      if (existingUser) {
        if (existingUser.email === email.toLowerCase()) {
          throw new ValidationError('User with this email already exists');
        }
        if (existingUser.phone === phone.replace(/\s+/g, '')) {
          throw new ValidationError('User with this phone number already exists');
        }
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password);

      // Create user
      const user = await prisma.user.create({
        data: {
          name: name.trim(),
          email: email.toLowerCase(),
          phone: phone.replace(/\s+/g, ''),
          password: hashedPassword,
          role: role as UserRole,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        }
      });

      // Generate tokens
      const tokenPayload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = await this.generateAccessToken(tokenPayload);
      const refreshToken = await this.generateRefreshToken(tokenPayload);

      return {
        user,
        accessToken,
        refreshToken,
        expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      console.error('Registration error:', error);
      throw new DatabaseError('Failed to create user account', 'REGISTRATION_FAILED');
    }
  }

  /**
   * Login user
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = credentials;

    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    if (!this.validateEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        throw new AuthenticationError('Invalid email or password');
      }

      if (!user.isActive) {
        throw new AuthenticationError('Account is deactivated. Please contact support.');
      }

      // Verify password
      const isPasswordValid = await this.comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Generate tokens
      const tokenPayload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = await this.generateAccessToken(tokenPayload);
      const refreshToken = await this.generateRefreshToken(tokenPayload);

      // Return user without password
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
        expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
      };
    } catch (error) {
      if (error instanceof ValidationError || error instanceof AuthenticationError) {
        throw error;
      }
      console.error('Login error:', error);
      throw new DatabaseError('Login failed', 'LOGIN_FAILED');
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      // Verify refresh token
      const payload = await this.verifyRefreshToken(refreshToken);

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        }
      });

      if (!user) {
        throw new AuthenticationError('User not found');
      }

      if (!user.isActive) {
        throw new AuthenticationError('Account is deactivated');
      }

      // Generate new tokens
      const tokenPayload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const newAccessToken = await this.generateAccessToken(tokenPayload);
      const newRefreshToken = await this.generateRefreshToken(tokenPayload);

      return {
        user,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
      };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      console.error('Token refresh error:', error);
      throw new AuthenticationError('Failed to refresh token');
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<Omit<User, 'password'> | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        }
      });

      return user;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  /**
   * Check if user has required role
   */
  static hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
    return requiredRoles.includes(userRole);
  }

  /**
   * Check if user is admin
   */
  static isAdmin(userRole: UserRole): boolean {
    return userRole === 'ADMIN';
  }

  /**
   * Check if user is decorator
   */
  static isDecorator(userRole: UserRole): boolean {
    return userRole === 'DECORATOR';
  }
}