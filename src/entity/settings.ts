export interface IInputSettings {
  supportEmail: string;
  currency: string;
  timezone: string;
  maxTicketsPerUser: number;
  allowRefunds: boolean;
}

export interface ISettings extends IInputSettings {
  key: string;
  createdAt: Date;
  updatedAt: Date;
}
