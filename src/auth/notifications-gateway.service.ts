import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class NotificationsGatewayService {
  private readonly logger = new Logger(NotificationsGatewayService.name);
  private readonly eventsUrl: string;

  constructor(
    private readonly httpService: HttpService,
    configService: ConfigService,
  ) {
    const baseGatewayUrl =
      configService.get<string>('API_GATEWAY_URL')?.replace(/\/+$/, '') ||
      'http://api-gateway';
    const eventsPath =
      configService.get<string>('NOTIFICATIONS_EVENTS_PATH') ||
      '/v1/notifications/events';

    this.eventsUrl = `${baseGatewayUrl}${
      eventsPath.startsWith('/') ? '' : '/'
    }${eventsPath}`;
  }

  async sendLoginEvent(
    userId: string,
    plan: string,
    metadata: Record<string, unknown>,
  ): Promise<void> {
    try {
      await lastValueFrom(
        this.httpService.post(
          this.eventsUrl,
          {
            userId,
            type: 'login',
            plan,
            metadata,
          },
          { timeout: 4000 },
        ),
      );
    } catch (error: unknown) {
      const reason =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.warn(
        `No se pudo enviar el evento de login a Notificaciones para ${userId}: ${reason}`,
      );
    }
  }
}
