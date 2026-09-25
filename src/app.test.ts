import { AddressInfo } from 'node:net';
import { Server } from 'node:http';

import { createApp } from './app';
import { EventDAL } from './dal/events.dal';
import { ISettingsDAL } from './dal/settings.dal';
import { TicketsDAL } from './dal/tickets.dal';
import { KEY_SETTINGS } from './constants/constants';
import { ISettings } from './entity/settings';

describe('createApp', () => {
  let server: Server;
  let baseUrl: string;

  const fakeSettings: ISettings = {
    key: KEY_SETTINGS,
    supportEmail: 'support@email.com',
    currency: 'USD',
    timezone: 'UTC',
    maxTicketsPerUser: 5,
    allowRefunds: false,
    createdAt: new Date('2026-09-25T07:32:42.132Z'),
    updatedAt: new Date('2026-09-25T16:11:12.301Z'),
  };

  beforeAll(async () => {
    const app = createApp({
      eventsDAL: { getEvents: jest.fn().mockResolvedValue([]) } as EventDAL,
      ticketsDAL: { getTicketsByEvent: jest.fn().mockResolvedValue([]) } as TicketsDAL,
      settingsDAL: {
        getSettings: jest.fn().mockResolvedValue(fakeSettings),
        updateSettings: jest.fn(),
      } as unknown as ISettingsDAL,
    });

    server = app.listen(0, '127.0.0.1');
    await new Promise<void>((resolve) => server.once('listening', resolve));
    const { port } = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it('should wire the health and settings routes', async () => {
    const healthResponse = await fetch(`${baseUrl}/health`);
    const settingsResponse = await fetch(`${baseUrl}/settings`);

    expect(healthResponse.status).toBe(200);
    await expect(healthResponse.json()).resolves.toEqual({ status: 'ok' });
    expect(settingsResponse.status).toBe(200);
    await expect(settingsResponse.json()).resolves.toEqual({
      ...fakeSettings,
      createdAt: fakeSettings.createdAt.toISOString(),
      updatedAt: fakeSettings.updatedAt.toISOString(),
    });
  });
});
