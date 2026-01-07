import { getRepository } from '@server/datasource';
import { User } from '@server/entity/User';
import type {
  Permission,
  PermissionCheckOptions,
} from '@server/lib/permissions';
import { getSettings } from '@server/lib/settings';
import logger from '@server/logger';

export const checkUser: Middleware = async (req, _res, next) => {
  const settings = getSettings();
  let user: User | undefined | null;

  logger.debug('Checking user authentication', {
    label: 'Auth',
    path: req.path,
    method: req.method,
    hasApiKey: !!req.header('X-API-Key'),
    hasSession: !!req.session?.userId,
    ip: req.ip,
  });

  if (req.header('X-API-Key') === settings.main.apiKey) {
    const userRepository = getRepository(User);

    let userId = 1; // Work on original administrator account

    // If a User ID is provided, we will act on that user's behalf
    if (req.header('X-API-User')) {
      userId = Number(req.header('X-API-User'));
      logger.debug('API request with user override', {
        label: 'Auth',
        userId,
        ip: req.ip,
      });
    }

    user = await userRepository.findOne({ where: { id: userId } });
    if (user) {
      logger.debug('User authenticated via API key', {
        label: 'Auth',
        userId: user.id,
        email: user.email,
        ip: req.ip,
      });
    } else {
      logger.warn('API key authentication failed - user not found', {
        label: 'Auth',
        userId,
        ip: req.ip,
      });
    }
  } else if (req.session?.userId) {
    const userRepository = getRepository(User);

    user = await userRepository.findOne({
      where: { id: req.session.userId },
    });
    if (user) {
      logger.debug('User authenticated via session', {
        label: 'Auth',
        userId: user.id,
        email: user.email,
        ip: req.ip,
      });
    } else {
      logger.warn('Session authentication failed - user not found', {
        label: 'Auth',
        sessionUserId: req.session.userId,
        ip: req.ip,
      });
    }
  } else {
    logger.debug('No authentication method found', {
      label: 'Auth',
      path: req.path,
      ip: req.ip,
    });
  }

  if (user) {
    req.user = user;
  }

  req.locale = user?.settings?.locale
    ? user.settings.locale
    : settings.main.locale;

  next();
};

export const isAuthenticated = (
  permissions?: Permission | Permission[],
  options?: PermissionCheckOptions
): Middleware => {
  const authMiddleware: Middleware = (req, res, next) => {
    if (!req.user || !req.user.hasPermission(permissions ?? 0, options)) {
      logger.warn('Permission denied', {
        label: 'Auth',
        path: req.path,
        method: req.method,
        userId: req.user?.id,
        requiredPermissions: permissions,
        ip: req.ip,
      });
      res.status(403).json({
        status: 403,
        error: 'You do not have permission to access this endpoint',
      });
    } else {
      logger.debug('Permission check passed', {
        label: 'Auth',
        path: req.path,
        userId: req.user.id,
        requiredPermissions: permissions,
        ip: req.ip,
      });
      next();
    }
  };
  return authMiddleware;
};
