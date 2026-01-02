import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class CaptchaService {
  private readonly logger = new Logger(CaptchaService.name);
  private readonly provider: 'recaptcha' | 'hcaptcha';
  private readonly secret: string | undefined;
  private readonly timeoutMs: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.provider =
      (this.configService.get<string>('CAPTCHA_PROVIDER') as
        | 'recaptcha'
        | 'hcaptcha') || 'recaptcha';
    this.secret = this.configService.get<string>('CAPTCHA_SECRET');
    this.timeoutMs =
      Number(this.configService.get<number>('CAPTCHA_TIMEOUT_MS')) || 3000;
  }

  async verify(token: string, remoteIp?: string): Promise<boolean> {
    if (!this.secret) {
      this.logger.warn('Captcha secret not configured, skipping verification.');
      return true; 
    }

    const url =
      this.provider === 'hcaptcha'
        ? 'https://hcaptcha.com/siteverify'
        : 'https://www.google.com/recaptcha/api/siteverify';

    const payload = new URLSearchParams();
    payload.append('secret', this.secret);
    payload.append('response', token);
    if (remoteIp) {
      payload.append('remoteip', remoteIp);
    }

    try {
      const res = await lastValueFrom(
        this.httpService.post(url, payload.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: this.timeoutMs,
        }),
      );
      const data = res.data as { success?: boolean; score?: number };
      if (!data.success) {
        this.logger.warn('Captcha verification failed: success=false');
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error('Captcha verification error', error);
      return false;
    }
  }
}
