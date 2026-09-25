import { Collection } from 'mongodb';

import { createSettingsDAL } from './settings.dal';
import { IInputSettings, ISettings } from '../entity/settings';
import { KEY_SETTINGS } from '../constants/constants';

describe('createSettingsDAL', () => {
  const findOne = jest.fn();
  const findOneAndUpdate = jest.fn();

  const collection = { findOne, findOneAndUpdate } as unknown as Collection<ISettings>;

  const fakeInputSettings: IInputSettings = {
    supportEmail: 'support@email.com',
    currency: 'COP',
    timezone: 'UTC',
    maxTicketsPerUser: 5,
    allowRefunds: false,
  };

  const fakeSettings: ISettings = {
    ...fakeInputSettings,
    key: KEY_SETTINGS,
    createdAt: new Date('2026-09-25T06:36:08.146Z'),
    updatedAt: new Date('2026-09-25T14:17:02.310Z'),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSettings', () => {
    it('should return null when document doesnt exist', async () => {
      findOne.mockReturnValue(null);

      const mockSettingsDAL = createSettingsDAL(collection);
      const result = await mockSettingsDAL.getSettings();

      expect(findOne).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return saved settings', async () => {
      findOne.mockReturnValue(fakeSettings);

      const mockSettingsDAL = createSettingsDAL(collection);
      const result = await mockSettingsDAL.getSettings();

      expect(findOne).toHaveBeenCalled();
      expect(result).toBe(fakeSettings);
    });

    it('should throw db error when trying to get settings', async () => {
      const dbError = new Error('Unabled to connected to DB');
      findOne.mockRejectedValue(dbError);

      const mockSettingsDAL = createSettingsDAL(collection);

      await expect(mockSettingsDAL.getSettings()).rejects.toThrow(dbError);
    });
  });
  describe('upserSettings', () => {
    it('should return the settings data the first time, isCreated: true', async () => {
      findOneAndUpdate.mockReturnValue({ value: fakeSettings, lastErrorObject: { updatedExisting: false } });

      const mockSettingsDAL = createSettingsDAL(collection);
      const result = await mockSettingsDAL.upserSettings(fakeInputSettings);

      expect(findOneAndUpdate).toHaveBeenCalled();
      expect(result).toMatchObject({ settings: fakeSettings, isCreated: true });
    });
    it('should return the updated settings data, isCreated: false', async () => {
      findOneAndUpdate.mockReturnValue({ value: fakeSettings, lastErrorObject: { updatedExisting: true } });

      const mockSettingsDAL = createSettingsDAL(collection);
      const result = await mockSettingsDAL.upserSettings(fakeInputSettings);

      expect(findOneAndUpdate).toHaveBeenCalled();
      expect(result).toMatchObject({ settings: fakeSettings, isCreated: false });
    });

    it('should throw db error when trying to save settings', async () => {
      const dbError = new Error('Unabled to connected to DB');
      findOneAndUpdate.mockRejectedValue(dbError);

      const mockSettingsDAL = createSettingsDAL(collection);

      await expect(mockSettingsDAL.getSettings()).rejects.toThrow(dbError);
    });
  });
});
