import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs/promises';

@Injectable()
export class MailerService {
  private readonly transporter: nodemailer.Transporter;
  constructor(private readonly configService: ConfigService) {
    const mailConfig = {
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT', 587),
      secure: false, 
      requireTLS: true,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
    };
    this.transporter = nodemailer.createTransport(mailConfig);
  }

  async sendMail({
    templatePath,
    context,
    ...mailOptions
  }: nodemailer.SendMailOptions & {
    templatePath?: string;
    context?: Record<string, unknown>;
  }): Promise<void> {
    let html: string | undefined;
    if (templatePath) {
      try {
        const template = await fs.readFile(templatePath, 'utf-8');

        html = template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
          context && key in context ? String(context[key]) : '',
        );
      } catch (error) {
        throw new Error(`Failed to read email template: ${error.message}`);
      }
    }

    const defaultFrom = `"${this.configService.get<string>('MAIL_DEFAULT_NAME', 'Default Name')}" <${this.configService.get<string>(
      'MAIL_DEFAULT_EMAIL',
      'noreply@example.com',
    )}>`;

    await this.transporter.sendMail({
      ...mailOptions,
      from: mailOptions.from || defaultFrom,
      html: mailOptions.html || html,
    });
  }
}
