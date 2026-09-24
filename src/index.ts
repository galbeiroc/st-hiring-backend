import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { knex } from 'knex';
import { MongoClient } from 'mongodb';

import dbConfig from './knexfile';
import { createEventDAL } from './dal/events.dal';
import { createTicketDAL } from './dal/tickets.dal';
import { createSettingsDAL } from './dal/settings.dal';

import { createGetEventsController } from './controllers/get-events';

import { ISettings } from './entity/settings';
import { COLLECTION, MONGO_DB_NAME } from './constants/constants';
import { createGetSettingsController } from './controllers/settings';

const Knex = knex(dbConfig.development);

const mongoClient = new MongoClient(process.env.MONGO_URI ?? 'mongodb://root:example@localhost:27017');

const settingsCollection = mongoClient.db(MONGO_DB_NAME).collection<ISettings>(COLLECTION);

const eventDAL = createEventDAL(Knex);
const TicketDAL = createTicketDAL(Knex);
const settingsDAL = createSettingsDAL(settingsCollection);

const app = express();

app.use(cors());
app.use(express.json());

app.use('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/events', createGetEventsController({ eventsDAL: eventDAL, ticketsDAL: TicketDAL }));
app.get('/settings', createGetSettingsController(settingsDAL));

app.use('/', (_req, res) => {
  res.json({ message: 'Hello API' });
});

app.listen(3000, () => {
  console.log('Server Started');
});
