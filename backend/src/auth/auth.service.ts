import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      console.log(`[Auth] User not found: ${email}`);
      return null;
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(`[Auth] Password validation for ${email}: ${isPasswordValid}`);
    
    if (isPasswordValid) {
      const { password, ...result } = user;
      return result;
    }
    
    console.log(`[Auth] Invalid password for user: ${email}`);
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Vérifier si l'email existe déjà
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Un compte avec cet email existe déjà');
    }

    try {
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      const user = await this.usersService.create({
        ...registerDto,
        password: hashedPassword,
      });
      return this.login(user);
    } catch (error: any) {
      // Gérer les erreurs de contrainte unique au cas où la vérification échoue
      if (error.code === '23505' || error.message?.includes('unique constraint')) {
        throw new ConflictException('Un compte avec cet email existe déjà');
      }
      throw error;
    }
  }

  async forgotPassword(email: string) {
    // TODO: Implement email sending logic
    return { message: 'Email de réinitialisation envoyé' };
  }
}









