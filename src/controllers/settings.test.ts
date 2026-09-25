import { Request, Response } from 'express';

import { createGetSettingsController, createPostSettingsController } from './settings';
import { IInputSettings, ISettings } from '../entity/settings';
import { ISavedSettings, ISettingsDAL } from '../dal/settings.dal';
import { KEY_SETTINGS } from '../constants/constants';

describe('Settings Controller', () => {
  const fakeInputSettings: IInputSettings = {
    supportEmail: 'support@email.com',
    currency: 'USD',
    timezone: 'UTC',
    maxTicketsPerUser: 5,
    allowRefunds: false,
  };

  const fakeSettings: ISettings = {
    ...fakeInputSettings,
    key: KEY_SETTINGS,
    createdAt: new Date('2026-09-25T07:32:42.132Z'),
    updatedAt: new Date('2026-09-25T16:11:12.301Z'),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createGetSettingsController', () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    it('should return status code 404 if there isnt setting', async () => {
      const mockSettingsDAL: ISettingsDAL = {
        getSettings: jest.fn().mockReturnValue(null),
        upserSettings: jest.fn(),
      };

      const settingsController = createGetSettingsController(mockSettingsDAL);
      await settingsController({} as Request, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Settings not found!' });
    });

    it('should retrieve settings data with status code 200', async () => {
      const mockSettingsDAL: ISettingsDAL = {
        getSettings: jest.fn().mockReturnValue(fakeSettings),
        upserSettings: jest.fn(),
      };

      const settingsController = createGetSettingsController(mockSettingsDAL);
      await settingsController({} as Request, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fakeSettings);
    });

    it('should return status code 500 if there is an error', async () => {
      const mockSettingsDAL: ISettingsDAL = {
        getSettings: jest.fn().mockRejectedValue(new Error('Unabled to connected to DB')),
        upserSettings: jest.fn(),
      };

      const settingsController = createGetSettingsController(mockSettingsDAL);
      await settingsController({} as Request, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to get settings' });
    });
  });

  describe('createPostSettingsController', () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const req = {
      body: fakeInputSettings,
    } as unknown as Request;

    it('should return status code 201 with saved settings data', async () => {
      const mockSettingsDAL: ISettingsDAL = {
        getSettings: jest.fn(),
        upserSettings: jest.fn().mockReturnValue({
          settings: fakeSettings,
          isCreated: true,
        } as ISavedSettings),
      };

      const settingsController = createPostSettingsController(mockSettingsDAL);
      await settingsController(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        settings: fakeSettings,
        isCreated: true,
      });
    });

    it('should return status code 200 with updated settings data', async () => {
      const mockSettingsDAL: ISettingsDAL = {
        getSettings: jest.fn(),
        upserSettings: jest.fn().mockReturnValue({
          settings: fakeSettings,
          isCreated: false,
        } as ISavedSettings),
      };

      const settingsController = createPostSettingsController(mockSettingsDAL);
      await settingsController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        settings: fakeSettings,
        isCreated: false,
      });
    });

    it('should return status code 500, if there is an error', async () => {
      const mockSettingsDAL: ISettingsDAL = {
        getSettings: jest.fn(),
        upserSettings: jest.fn().mockRejectedValue(new Error('Unabled to connected to DB')),
      };

      const settingsController = createPostSettingsController(mockSettingsDAL);
      await settingsController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Failed to save settings',
      });
    });
  });
});
