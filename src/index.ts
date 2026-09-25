import 'dotenv/config';
import { knex } from 'knex';

import { createApp } from './app';
import dbConfig from './knexfile';
import { createEventDAL } from './dal/events.dal';
import { createSettingsDAL } from './dal/settings.dal';
import { createTicketDAL } from './dal/tickets.dal';
import { connectMongoDB } from './database/mongo';

const PORT = 3000;

const startServer = async (): Promise<void> => {
  const database = knex(dbConfig.development);
  const { client: mongoClient, settingsCollection } = await connectMongoDB();

  const app = createApp({
    eventsDAL: createEventDAL(database),
    ticketsDAL: createTicketDAL(database),
    settingsDAL: createSettingsDAL(settingsCollection),
  });

  const server = app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });

  const shutdown = async (): Promise<void> => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    await Promise.all([mongoClient.close(), database.destroy()]);
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
};

startServer().catch((error: unknown) => {
  console.error('Failed to start server', error);
  process.exitCode = 1;
});
