import { getRepository } from '@server/datasource';
import { User } from '@server/entity/User';
import { UserSettings } from '@server/entity/UserSettings';
import type { UserSettingsGeneralResponse } from '@server/interfaces/api/userSettingsInterfaces';
import { Permission } from '@server/lib/permissions';
import { isAuthenticated } from '@server/middleware/auth';
import { Router } from 'express';
import { canMakePermissionsChange } from '.';

const isOwnProfileOrAdmin = (): Middleware => {
  const authMiddleware: Middleware = (req, res, next) => {
    if (
      !req.user?.hasPermission(Permission.MANAGE_USERS) &&
      req.user?.id !== Number(req.params.id)
    ) {
      return next({
        status: 403,
        message: "You do not have permission to view this user's settings.",
      });
    }

    next();
  };
  return authMiddleware;
};

const userSettingsRoutes = Router({ mergeParams: true });

userSettingsRoutes.get<{ id: string }, UserSettingsGeneralResponse>(
  '/main',
  isOwnProfileOrAdmin(),
  async (req, res, next) => {
    const userRepository = getRepository(User);

    try {
      const user = await userRepository.findOne({
        where: { id: Number(req.params.id) },
      });

      if (!user) {
        return next({ status: 404, message: 'User not found.' });
      }

      return res.status(200).json({
        username: user.username,
        locale: user.settings?.locale,
        region: user.settings?.region,
        originalLanguage: user.settings?.originalLanguage,
      });
    } catch (e) {
      next({ status: 500, message: e.message });
    }
  }
);

userSettingsRoutes.post<
  { id: string },
  UserSettingsGeneralResponse,
  UserSettingsGeneralResponse
>('/main', isOwnProfileOrAdmin(), async (req, res, next) => {
  const userRepository = getRepository(User);

  try {
    const user = await userRepository.findOne({
      where: { id: Number(req.params.id) },
    });

    if (!user) {
      return next({ status: 404, message: 'User not found.' });
    }

    // "Owner" user settings cannot be modified by other users
    if (user.id === 1 && req.user?.id !== 1) {
      return next({
        status: 403,
        message: "You do not have permission to modify this user's settings.",
      });
    }

    user.username = req.body.username;

    if (!user.settings) {
      user.settings = new UserSettings({
        user: req.user,
        locale: req.body.locale,
        region: req.body.region,
        originalLanguage: req.body.originalLanguage,
      });
    } else {
      user.settings.locale = req.body.locale;
      user.settings.region = req.body.region;
      user.settings.originalLanguage = req.body.originalLanguage;
    }

    await userRepository.save(user);

    return res.status(200).json({
      username: user.username,
      locale: user.settings.locale,
      region: user.settings.region,
      originalLanguage: user.settings.originalLanguage,
    });
  } catch (e) {
    next({ status: 500, message: e.message });
  }
});

userSettingsRoutes.get<
  { id: string },
  { username?: string; appendToTitle?: boolean; appendToSummary?: boolean }
>('/playlists', isOwnProfileOrAdmin(), async (req, res, next) => {
  const userRepository = getRepository(User);

  try {
    const user = await userRepository.findOne({
      where: { id: Number(req.params.id) },
    });

    if (!user) {
      return next({ status: 404, message: 'User not found.' });
    }

    return res.status(200).json({
      username: user.username,
      appendToTitle: user.settings?.appendToTitle,
      appendToSummary: user.settings?.appendToSummary,
    });
  } catch (e) {
    next({ status: 500, message: e.message });
  }
});

userSettingsRoutes.post<
  { id: string },
  UserSettingsGeneralResponse,
  UserSettingsGeneralResponse
>('/playlists', isOwnProfileOrAdmin(), async (req, res, next) => {
  const userRepository = getRepository(User);

  try {
    const user = await userRepository.findOne({
      where: { id: Number(req.params.id) },
    });

    if (!user) {
      return next({ status: 404, message: 'User not found.' });
    }

    // "Owner" user settings cannot be modified by other users
    if (user.id === 1 && req.user?.id !== 1) {
      return next({
        status: 403,
        message: "You do not have permission to modify this user's settings.",
      });
    }

    if (!user.settings) {
      user.settings = new UserSettings({
        user: req.user,
        appendToTitle: true,
        appendToSummary: true,
      });
    } else {
      user.settings.appendToTitle = req.body.appendToTitle;
      user.settings.appendToSummary = req.body.appendToSummary;
    }

    await userRepository.save(user);

    return res.status(200).json({
      username: user.username,
      appendToTitle: user.settings.appendToTitle,
      appendToSummary: user.settings.appendToSummary,
    });
  } catch (e) {
    next({ status: 500, message: e.message });
  }
});

userSettingsRoutes.get<{ id: string }, { permissions?: number }>(
  '/permissions',
  isAuthenticated(Permission.MANAGE_USERS),
  async (req, res, next) => {
    const userRepository = getRepository(User);

    try {
      const user = await userRepository.findOne({
        where: { id: Number(req.params.id) },
      });

      if (!user) {
        return next({ status: 404, message: 'User not found.' });
      }

      return res.status(200).json({ permissions: user.permissions });
    } catch (e) {
      next({ status: 500, message: e.message });
    }
  }
);

userSettingsRoutes.post<
  { id: string },
  { permissions?: number },
  { permissions: number }
>(
  '/permissions',
  isAuthenticated(Permission.MANAGE_USERS),
  async (req, res, next) => {
    const userRepository = getRepository(User);

    try {
      const user = await userRepository.findOne({
        where: { id: Number(req.params.id) },
      });

      if (!user) {
        return next({ status: 404, message: 'User not found.' });
      }

      // "Owner" user permissions cannot be modified, and users cannot set their own permissions
      if (user.id === 1 || req.user?.id === user.id) {
        return next({
          status: 403,
          message: 'You do not have permission to modify this user',
        });
      }

      if (!canMakePermissionsChange(req.body.permissions, req.user)) {
        return next({
          status: 403,
          message: 'You do not have permission to grant this level of access',
        });
      }
      user.permissions = req.body.permissions;

      await userRepository.save(user);

      return res.status(200).json({ permissions: user.permissions });
    } catch (e) {
      next({ status: 500, message: e.message });
    }
  }
);

export default userSettingsRoutes;
