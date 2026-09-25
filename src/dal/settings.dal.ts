import { Collection } from 'mongodb';
import { IInputSettings, ISettings } from '../entity/settings';
import { KEY_SETTINGS } from '../constants/constants';

export interface ISavedSettings {
  settings: ISettings;
  isCreated: boolean;
}

export interface ISettingsDAL {
  getSettings: () => Promise<ISettings | null>;
  upserSettings: (inputSettings: IInputSettings) => Promise<ISavedSettings>;
}

export const createSettingsDAL = (collection: Collection<ISettings>): ISettingsDAL => ({
  async getSettings(): Promise<ISettings | null> {
    return collection.findOne({ key: KEY_SETTINGS });
  },
  async upserSettings(inputSettings): Promise<ISavedSettings> {
    const now = new Date();

    const result = await collection.findOneAndUpdate(
      {
        key: KEY_SETTINGS,
      },
      {
        $set: { ...inputSettings, updatedAt: now },
        $setOnInsert: { key: KEY_SETTINGS, createdAt: now },
      },
      {
        upsert: true,
        returnDocument: 'after',
        includeResultMetadata: true,
      },
    );

    const isCreated = result.lastErrorObject?.updatedExisting === false;
    const settings = result.value as ISettings;

    return { settings, isCreated };
  },
});
