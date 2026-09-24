import { Collection } from 'mongodb';
import { ISettings } from '../entity/settings';
import { SETTINGS_ID } from '../constants/constants';

export interface ISettingsDAL {
  getSettings: () => Promise<ISettings | null>;
  upserSettings?: () => Promise<ISettings>;
}

export const createSettingsDAL = (collection: Collection<ISettings>): ISettingsDAL => ({
  async getSettings() {
    return collection.findOne({ id: SETTINGS_ID });
  }
});
