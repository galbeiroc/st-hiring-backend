import { Response, Request } from 'express';
import { ISettingsDAL } from '../dal/settings.dal';

export const createGetSettingsController =
  (settingsDAL: ISettingsDAL) =>
  async (_req: Request, res: Response) => {
    try {
      const settings = await settingsDAL.getSettings();

      if (!settings) {
        return res.status(404).json({ message: 'Settings not found!' });
      }

      return res.status(200).json(settings);
    } catch (error) {
      console.error('[getSettingController]', error);
      return res.status(500).json({ message: 'Failed to get settings' });
    }
  };
