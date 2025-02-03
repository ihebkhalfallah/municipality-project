import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity';
import { UserService } from 'src/users/user.service';
import { MailerService } from 'src/mailer/mailer.service';
import * as path from 'path';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private mailerService: MailerService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findOneByEmail(email);
    if (user?.locked) {
      throw new UnauthorizedException('Your account is locked.');
    }
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async login(user: User) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRATION'),
    });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    const resetToken = this.jwtService.sign(
      { id: user.id },
      { expiresIn: '15m' },
    );

    const templatePath = path.join(
      __dirname,
      '..',
      'mailer',
      'templates',
      'reset-password-template.html',
    );

    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset Request',
      templatePath: templatePath,
      context: {
        name: user.firstName,
        resetToken: resetToken,
      },
    });

    return { message: 'Reset password email sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const decoded = this.jwtService.verify(token);

      const user = await this.userService.findOne(decoded.id);

      if (!user) throw new NotFoundException('Invalid token');

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      user.password = hashedPassword;
      await this.userRepository.update(decoded.id, user);

      return { message: 'Password successfully reset' };
    } catch (error) {
      throw new BadRequestException('Invalid or expired token');
    }
  }
  
  
}
