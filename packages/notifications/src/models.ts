export type NotificationChannel = 'email' | 'sms' | 'in-app';

export interface NotificationPayload {
  id: string;
  recipient: string;
  title: string;
  body: string;
  channel: NotificationChannel;
  createdAt: string;
}
