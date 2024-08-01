import PlexAPI from '@server/api/plexapi';
import PlexTvAPI from '@server/api/plextv';
import { getRepository } from '@server/datasource';
import { User } from '@server/entity/User';
import { UserPlaylists } from '@server/entity/UserPlaylists';
import type { UserResultsResponse } from '@server/interfaces/api/userInterfaces';
import { updateShowEpisodes } from '@server/lib/entityFunctions';
import { hasPermission, Permission } from '@server/lib/permissions';
import plexShuffle from '@server/lib/plexShuffle';
import type { TVShow } from '@server/lib/scanners/plexScanner';
import { plexShowScanner } from '@server/lib/scanners/plexScanner';
import { getSettings } from '@server/lib/settings';
import logger from '@server/logger';
import { isAuthenticated } from '@server/middleware/auth';
import { getPlexUrl } from '@server/utils';
import { Router } from 'express';
import gravatarUrl from 'gravatar-url';
import { In } from 'typeorm';
import userSettingsRoutes from './usersettings';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const pageSize = req.query.take ? Number(req.query.take) : 10;
    const skip = req.query.skip ? Number(req.query.skip) : 0;
    let query = getRepository(User).createQueryBuilder('user');

    switch (req.query.sort) {
      case 'updated':
        query = query.orderBy('user.updatedAt', 'DESC');
        break;
      case 'displayname':
        query = query.orderBy(
          "(CASE WHEN (user.username IS NULL OR user.username = '') THEN (CASE WHEN (user.plexUsername IS NULL OR user.plexUsername = '') THEN user.email ELSE LOWER(user.plexUsername) END) ELSE LOWER(user.username) END)",
          'ASC'
        );
        break;
      default:
        query = query.orderBy('user.id', 'ASC');
        break;
    }

    const [users, userCount] = await query
      .take(pageSize)
      .skip(skip)
      .getManyAndCount();

    return res.status(200).json({
      pageInfo: {
        pages: Math.ceil(userCount / pageSize),
        pageSize,
        results: userCount,
        page: Math.ceil(skip / pageSize) + 1,
      },
      results: User.filterMany(
        users,
        req.user?.hasPermission(Permission.MANAGE_USERS)
      ),
    } as UserResultsResponse);
  } catch (e) {
    next({ status: 500, message: e.message });
  }
});

router.post(
  '/',
  isAuthenticated(Permission.MANAGE_USERS),
  async (req, res, next) => {
    try {
      const settings = getSettings();

      const body = req.body;
      const userRepository = getRepository(User);

      const existingUser = await userRepository
        .createQueryBuilder('user')
        .where('user.email = :email', {
          email: body.email.toLowerCase(),
        })
        .getOne();

      if (existingUser) {
        return next({
          status: 409,
          message: 'User already exists with submitted email.',
          errors: ['USER_EXISTS'],
        });
      }

      const passedExplicitPassword = body.password && body.password.length > 0;
      const avatar = gravatarUrl(body.email, { default: 'mm', size: 200 });

      if (!passedExplicitPassword) {
        throw new Error('Email notifications must be enabled');
      }

      const user = new User({
        avatar: body.avatar ?? avatar,
        username: body.username,
        email: body.email,
        permissions: settings.main.defaultPermissions,
        plexToken: '',
      });

      await userRepository.save(user);
      return res.status(201).json(user.filter());
    } catch (e) {
      next({ status: 500, message: e.message });
    }
  }
);

router.get<{ id: string }>('/:id', async (req, res, next) => {
  try {
    const userRepository = getRepository(User);

    const user = await userRepository.findOneOrFail({
      where: { id: Number(req.params.id) },
    });

    return res
      .status(200)
      .json(user.filter(req.user?.hasPermission(Permission.MANAGE_USERS)));
  } catch (e) {
    next({ status: 404, message: 'User not found.' });
  }
});

router.get<{ id: string }>('/:id/playlists', async (req, res, next) => {
  const plexUrl = getPlexUrl();
  try {
    const userRepository = getRepository(User);

    const user = await userRepository.findOneOrFail({
      select: { id: true, plexToken: true },
      where: { id: Number(req.params.id) },
    });

    const query = req.query.query as string;

    const itemsPerPage = 20;
    const page = Number(req.query.page) ?? 1;
    const offset = (page - 1) * itemsPerPage;

    const plexClient = new PlexAPI({ plexToken: user.plexToken });
    const result = await plexClient.getPlaylists({
      offset,
      size: itemsPerPage,
      filter: query,
      userToken: user.plexToken,
    });
    const machineID = await plexClient.getIdentity();

    return res.status(200).json({
      page,
      totalPages: Math.ceil(result.totalSize / itemsPerPage),
      totalResults: result.totalSize,
      results: result.items.map((item) => ({
        ratingKey: item.ratingKey,
        url: `${plexUrl}/web/index.html#!/server/${machineID.machineIdentifier}/playlist?key=/playlists/${item.ratingKey}`,
        title: item.title,
        mediaType: 'playlist',
        thumb: item.thumb,
        summary: item.summary,
      })),
    });
  } catch (e) {
    next({ status: 404, message: 'User not found.' });
  }
});

router.use('/:id/settings', userSettingsRoutes);

export const canMakePermissionsChange = (
  permissions: number,
  user?: User
): boolean =>
  // Only let the owner grant admin privileges
  !(hasPermission(Permission.ADMIN, permissions) && user?.id !== 1);

router.put<
  Record<string, never>,
  Partial<User>[],
  { ids: string[]; permissions: number }
>('/', isAuthenticated(Permission.MANAGE_USERS), async (req, res, next) => {
  try {
    const isOwner = req.user?.id === 1;

    if (!canMakePermissionsChange(req.body.permissions, req.user)) {
      return next({
        status: 403,
        message: 'You do not have permission to grant this level of access',
      });
    }

    const userRepository = getRepository(User);

    const users: User[] = await userRepository.find({
      where: {
        id: In(
          isOwner ? req.body.ids : req.body.ids.filter((id) => Number(id) !== 1)
        ),
      },
    });

    const updatedUsers = await Promise.all(
      users.map(async (user) => {
        return userRepository.save(<User>{
          ...user,
          ...{ permissions: req.body.permissions },
        });
      })
    );

    return res.status(200).json(updatedUsers);
  } catch (e) {
    next({ status: 500, message: e.message });
  }
});

router.put<{ id: string }>(
  '/:id',
  isAuthenticated(Permission.MANAGE_USERS),
  async (req, res, next) => {
    try {
      const userRepository = getRepository(User);

      const user = await userRepository.findOneOrFail({
        where: { id: Number(req.params.id) },
      });

      // Only let the owner user modify themselves
      if (user.id === 1 && req.user?.id !== 1) {
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

      Object.assign(user, {
        username: req.body.username,
        permissions: req.body.permissions,
      });

      await userRepository.save(user);

      return res.status(200).json(user.filter());
    } catch (e) {
      next({ status: 404, message: 'User not found.' });
    }
  }
);

router.delete<{ id: string }>(
  '/:id',
  isAuthenticated(Permission.MANAGE_USERS),
  async (req, res, next) => {
    try {
      const userRepository = getRepository(User);

      const user = await userRepository.findOne({
        where: { id: Number(req.params.id) },
      });

      if (!user) {
        return next({ status: 404, message: 'User not found.' });
      }

      if (user.id === 1) {
        return next({
          status: 405,
          message: 'This account cannot be deleted.',
        });
      }

      if (user.hasPermission(Permission.ADMIN) && req.user?.id !== 1) {
        return next({
          status: 405,
          message: 'You cannot delete users with administrative privileges.',
        });
      }

      /**
       * Requests are usually deleted through a cascade constraint. Those however, do
       * not trigger the removal event so listeners to not run and the parent Media
       * will not be updated back to unknown for titles that were still pending. So
       * we manually remove all requests from the user here so the parent media's
       * properly reflect the change.
       */
      await userRepository.delete(user.id);
      return res.status(200).json(user.filter());
    } catch (e) {
      logger.error('Something went wrong deleting a user', {
        label: 'API',
        userId: req.params.id,
        errorMessage: e.message,
      });
      return next({
        status: 500,
        message: 'Something went wrong deleting the user',
      });
    }
  }
);

router.post(
  '/import-from-plex',
  isAuthenticated(Permission.MANAGE_USERS),
  async (req, res, next) => {
    try {
      const settings = getSettings();
      const userRepository = getRepository(User);
      const body = req.body as { plexIds: string[] } | undefined;

      // taken from auth.ts
      const mainUser = await userRepository.findOneOrFail({
        select: { id: true, plexToken: true },
        where: { id: 1 },
      });
      const mainPlexTv = new PlexTvAPI(mainUser.plexToken ?? '');

      const plexUsersResponse = await mainPlexTv.getUsers();
      const createdUsers: User[] = [];
      for (const rawUser of plexUsersResponse.MediaContainer.User) {
        const account = rawUser.$;

        if (account.email) {
          const user = await userRepository
            .createQueryBuilder('user')
            .where('user.plexId = :id', { id: account.id })
            .orWhere('user.email = :email', {
              email: account.email.toLowerCase(),
            })
            .getOne();

          if (user) {
            // Update the user's avatar with their Plex thumbnail, in case it changed
            user.avatar = account.thumb;
            user.email = account.email;
            user.plexUsername = account.username;

            // In case the user was previously a local account
            await userRepository.save(user);
          } else if (!body || body.plexIds.includes(account.id)) {
            if (await mainPlexTv.checkUserAccess(parseInt(account.id))) {
              const newUser = new User({
                plexUsername: account.username,
                email: account.email,
                permissions: settings.main.defaultPermissions,
                plexId: parseInt(account.id),
                plexToken: '',
                avatar: account.thumb,
              });
              await userRepository.save(newUser);
              createdUsers.push(newUser);
            }
          }
        }
      }

      return res.status(201).json(User.filterMany(createdUsers));
    } catch (e) {
      next({ status: 500, message: e.message });
    }
  }
);

router.post('/shuffled-playlist', async (req, res, next) => {
  try {
    const userRepository = getRepository(User);
    const playlistRepository = getRepository(UserPlaylists);
    if (!req.user) {
      return res.status(500).json({
        status: 500,
        error: 'Please sign in.',
      });
    }

    const settings = getSettings();

    const user = await userRepository.findOneOrFail({
      select: { id: true, plexToken: true, playlists: true },
      where: { id: req.user.id },
    });

    const plexClient = new PlexAPI({ plexToken: user.plexToken });

    const allEpisodes: TVShow[] = await plexShowScanner.run(
      user.plexToken,
      req.body.playlists,
      req.body.unwatchedOnly
    );

    const shuffledEpisodes = plexShuffle(allEpisodes);

    const playlistTitle = user.settings?.appendToTitle
      ? req.body.playlistTitle + ` (${settings.main.applicationTitle})`
      : req.body.playlistTitle;

    const summary = user.settings?.appendToSummary
      ? req.body.playlistDescription +
        ` [Created with ${settings.main.applicationTitle}]`
      : req.body.playlistDescription;

    const response = await plexClient.createPlaylist(
      playlistTitle,
      shuffledEpisodes,
      user.plexToken
    );

    if (response) {
      const currentPlaylist = await playlistRepository.findOne({
        where: { ratingKey: response[0].ratingKey },
      });

      const updatedShowEpisodes = await updateShowEpisodes(allEpisodes);

      if (currentPlaylist) {
        currentPlaylist.numEpisodes = updatedShowEpisodes.totalEpisodes;
        currentPlaylist.numEpisodesUnwatched =
          updatedShowEpisodes.totalUnwatchedEpisodes;
        currentPlaylist.unwatchedInd = req.body.unwatchedOnly;
        currentPlaylist.shows = updatedShowEpisodes.showEnitities;

        await playlistRepository.save(currentPlaylist);
      } else {
        const newPlaylist = new UserPlaylists();

        newPlaylist.ratingKey = response[0].ratingKey;
        newPlaylist.numEpisodes = updatedShowEpisodes.totalEpisodes;
        newPlaylist.numEpisodesUnwatched =
          updatedShowEpisodes.totalUnwatchedEpisodes;
        newPlaylist.unwatchedInd = req.body.unwatchedOnly;
        newPlaylist.shows = updatedShowEpisodes.showEnitities;
        newPlaylist.user = user;

        await playlistRepository.save(newPlaylist);
      }

      const editResponse = await plexClient.editPlaylist({
        ratingKey: response[0].ratingKey,
        userToken: user.plexToken,
        title: playlistTitle,
        summary: summary,
        thumb: req.body.playlistCoverUrl,
      });

      if (editResponse) {
        return res.status(editResponse.status).json(editResponse);
      }
    }

    return res.status(200).json(response);
  } catch (e) {
    next({ status: 404, message: 'User not found.' });
  }
});

export default router;
