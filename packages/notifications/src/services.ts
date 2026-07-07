import type { NotificationPayload } from './models';

export class NotificationService {
  async send(payload: NotificationPayload): Promise<NotificationPayload> {
    return payload;
  }

  async sendBatch(payloads: NotificationPayload[]): Promise<NotificationPayload[]> {
    return payloads;
  }
}
