import { Collection, MongoClient } from 'mongodb';

import { COLLECTION, MONGO_DB_NAME } from '../constants/constants';
import { ISettings } from '../entity/settings';

export interface MongoConnection {
  client: MongoClient;
  settingsCollection: Collection<ISettings>;
}

export const connectMongoDB = async (): Promise<MongoConnection> => {
  const client = new MongoClient(process.env.MONGO_URI ?? 'mongodb://root:example@localhost:27017');
  await client.connect();

  return {
    client,
    settingsCollection: client.db(MONGO_DB_NAME).collection<ISettings>(COLLECTION),
  };
};
