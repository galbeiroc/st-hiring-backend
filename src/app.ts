import cors from 'cors';
import express, { Express } from 'express';

import { createGetEventsController } from './controllers/get-events';
import { createGetSettingsController, createPostSettingsController } from './controllers/settings';
import { EventDAL } from './dal/events.dal';
import { ISettingsDAL } from './dal/settings.dal';
import { TicketsDAL } from './dal/tickets.dal';

export interface AppDependencies {
  eventsDAL: EventDAL;
  ticketsDAL: TicketsDAL;
  settingsDAL: ISettingsDAL;
}

export const createApp = ({ eventsDAL, ticketsDAL, settingsDAL }: AppDependencies): Express => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/events', createGetEventsController({ eventsDAL, ticketsDAL }));
  app.get('/settings', createGetSettingsController(settingsDAL));
  app.post('/settings', createPostSettingsController(settingsDAL));

  app.use('/', (_req, res) => {
    res.json({ message: 'Hello API' });
  });

  return app;
};
