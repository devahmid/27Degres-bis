import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
    private configService: ConfigService,
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
      
      // Envoyer un email de bienvenue
      try {
        await this.mailService.sendWelcomeEmail(user.email, user.firstName);
      } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email de bienvenue:', error);
        // Ne pas faire échouer l'inscription si l'email échoue
      }
      
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
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Ne pas révéler si l'email existe ou non pour des raisons de sécurité
      return { message: 'Si cet email existe, un lien de réinitialisation a été envoyé' };
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // Valide pendant 1 heure

    // Sauvegarder le token dans la base de données
    await this.usersService.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    });

    // Construire l'URL de réinitialisation
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:4200');
    const resetUrl = `${frontendUrl}/auth/reset-password`;

    // Envoyer l'email
    try {
      await this.mailService.sendPasswordResetEmail(user.email, resetToken, resetUrl);
      return { message: 'Si cet email existe, un lien de réinitialisation a été envoyé' };
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
      throw new Error('Erreur lors de l\'envoi de l\'email de réinitialisation');
    }
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByPasswordResetToken(token);
    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new NotFoundException('Token invalide ou expiré');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(user.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    return { message: 'Mot de passe réinitialisé avec succès' };
  }
}









