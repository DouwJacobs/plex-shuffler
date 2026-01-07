import PlexTvAPI from '@server/api/plextv';
import { getRepository } from '@server/datasource';
import { User } from '@server/entity/User';
import { Permission } from '@server/lib/permissions';
import { getSettings } from '@server/lib/settings';
import logger from '@server/logger';
import { isAuthenticated } from '@server/middleware/auth';
import { Router } from 'express';

const authRoutes = Router();

authRoutes.get('/me', isAuthenticated(), async (req, res) => {
  logger.debug('Get current user endpoint called', {
    label: 'API',
    userId: req.user?.id,
    ip: req.ip,
  });
  const userRepository = getRepository(User);
  if (!req.user) {
    logger.warn('Get current user called without authenticated user', {
      label: 'API',
      ip: req.ip,
    });
    return res.status(500).json({
      status: 500,
      error: 'Please sign in.',
    });
  }
  const user = await userRepository.findOneOrFail({
    where: { id: req.user.id },
  });

  logger.debug('Current user retrieved', {
    label: 'API',
    userId: user.id,
    email: user.email,
  });
  return res.status(200).json(user);
});

authRoutes.get('/me/token', isAuthenticated(), async (req, res) => {
  const userRepository = getRepository(User);
  if (!req.user) {
    return res.status(500).json({
      status: 500,
      error: 'Please sign in.',
    });
  }
  const user = await userRepository.findOneOrFail({
    select: { id: true, plexToken: true },
    where: { id: req.user.id },
  });

  return res.status(200).json(user);
});

authRoutes.post('/plex', async (req, res, next) => {
  logger.info('Plex authentication attempt', {
    label: 'API',
    ip: req.ip,
    hasAuthToken: !!req.body?.authToken,
  });
  const settings = getSettings();
  const userRepository = getRepository(User);
  const body = req.body as { authToken?: string };

  if (!body.authToken) {
    logger.warn('Plex authentication attempt without token', {
      label: 'API',
      ip: req.ip,
    });
    return next({
      status: 500,
      message: 'Authentication token required.',
    });
  }
  try {
    // First we need to use this auth token to get the user's email from plex.tv
    logger.debug('Fetching user account from Plex.tv', {
      label: 'API',
      ip: req.ip,
    });
    const plextv = new PlexTvAPI(body.authToken);
    const account = await plextv.getUser();
    logger.debug('Plex.tv user account retrieved', {
      label: 'API',
      plexId: account.id,
      email: account.email,
      username: account.username,
      ip: req.ip,
    });

    // Next let's see if the user already exists
    let user = await userRepository
      .createQueryBuilder('user')
      .where('user.plexId = :id', { id: account.id })
      .orWhere('user.email = :email', {
        email: account.email.toLowerCase(),
      })
      .getOne();

    if (!user && !(await userRepository.count())) {
      logger.info('Creating first admin user', {
        label: 'API',
        email: account.email,
        plexId: account.id,
        plexUsername: account.username,
        ip: req.ip,
      });
      user = new User({
        email: account.email,
        plexUsername: account.username,
        plexId: account.id,
        plexToken: account.authToken,
        permissions: Permission.ADMIN,
        avatar: account.thumb,
      });

      await userRepository.save(user);
      logger.info('First admin user created successfully', {
        label: 'API',
        userId: user.id,
        email: user.email,
      });
    } else {
      const mainUser = await userRepository.findOneOrFail({
        select: { id: true, plexToken: true, plexId: true, email: true },
        where: { id: 1 },
      });
      const mainPlexTv = new PlexTvAPI(mainUser.plexToken ?? '');

      if (!account.id) {
        logger.error('Plex ID was missing from Plex.tv response', {
          label: 'API',
          ip: req.ip,
          email: account.email,
          plexUsername: account.username,
        });

        return next({
          status: 500,
          message: 'Something went wrong. Try again.',
        });
      }

      if (
        account.id === mainUser.plexId ||
        (account.email === mainUser.email && !mainUser.plexId) ||
        (await mainPlexTv.checkUserAccess(account.id))
      ) {
        if (user) {
          if (!user.plexId) {
            logger.info(
              'Found matching Plex user; updating user with Plex data',
              {
                label: 'API',
                ip: req.ip,
                email: user.email,
                userId: user.id,
                plexId: account.id,
                plexUsername: account.username,
              }
            );
          }

          const userServerToken = await mainPlexTv.getUserAccessToken(
            account.id
          );

          if (
            account.id === mainUser.plexId ||
            (account.email === mainUser.email && !mainUser.plexId)
          ) {
            user.plexToken = body.authToken;
            user.permissions = Permission.ADMIN;
          } else {
            user.plexToken = userServerToken;
          }

          user.plexId = account.id;
          user.avatar = account.thumb;
          user.email = account.email;
          user.plexUsername = account.username;

          await userRepository.save(user);
        } else if (!settings.main.newPlexLogin) {
          logger.warn(
            'Failed sign-in attempt by unimported Plex user with access to the media server',
            {
              label: 'API',
              ip: req.ip,
              email: account.email,
              plexId: account.id,
              plexUsername: account.username,
            }
          );
          return next({
            status: 403,
            message: 'Access denied.',
          });
        } else {
          logger.info(
            'Sign-in attempt from Plex user with access to the media server; creating new Plex Shuffler user',
            {
              label: 'API',
              ip: req.ip,
              email: account.email,
              plexId: account.id,
              plexUsername: account.username,
            }
          );
          const userServerToken = await mainPlexTv.getUserAccessToken(
            account.id
          );
          user = new User({
            email: account.email,
            plexUsername: account.username,
            plexId: account.id,
            plexToken: userServerToken,
            permissions: settings.main.defaultPermissions,
            avatar: account.thumb,
          });

          await userRepository.save(user);
        }
      } else {
        logger.warn(
          'Failed sign-in attempt by Plex user without access to the media server',
          {
            label: 'API',
            ip: req.ip,
            email: account.email,
            plexId: account.id,
            plexUsername: account.username,
          }
        );
        return next({
          status: 403,
          message: 'Access denied.',
        });
      }
    }

    // Set logged in session
    if (req.session) {
      req.session.userId = user.id;
      logger.info('User session created', {
        label: 'API',
        userId: user.id,
        email: user.email,
        ip: req.ip,
      });
    }

    logger.info('Plex authentication successful', {
      label: 'API',
      userId: user?.id,
      email: user?.email,
      ip: req.ip,
    });
    return res.status(200).json(user?.filter() ?? {});
  } catch (e) {
    logger.error('Something went wrong authenticating with Plex account', {
      label: 'API',
      errorMessage: e.message,
      ip: req.ip,
    });
    return next({
      status: 500,
      message: 'Unable to authenticate.',
    });
  }
});

authRoutes.post('/logout', (req, res, next) => {
  logger.info('User logout attempt', {
    label: 'API',
    userId: req.user?.id,
    ip: req.ip,
  });
  req.session?.destroy((err) => {
    if (err) {
      logger.error('Failed to destroy session during logout', {
        label: 'API',
        userId: req.user?.id,
        error: err.message,
        ip: req.ip,
      });
      return next({
        status: 500,
        message: 'Something went wrong.',
      });
    }

    logger.info('User logged out successfully', {
      label: 'API',
      userId: req.user?.id,
      ip: req.ip,
    });
    return res.status(200).json({ status: 'ok' });
  });
});

export default authRoutes;
