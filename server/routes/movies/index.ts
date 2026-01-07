import PlexAPI from '@server/api/plexapi';
import { getRepository } from '@server/datasource';
import { User } from '@server/entity/User';
import { getLibraries, getSettings } from '@server/lib/settings';
import logger from '@server/logger';
import { getPlexUrl } from '@server/utils';
import { Router } from 'express';

const movieRoutes = Router();

movieRoutes.get('/libraries', async (req, res) => {
  logger.debug('Get movie libraries endpoint called', {
    label: 'API',
    userId: req.user?.id,
    ip: req.ip,
  });
  const movieLibraries = await getLibraries('movie', req.user?.id);
  logger.debug('Movie libraries retrieved', {
    label: 'API',
    libraryCount: movieLibraries.length,
    userId: req.user?.id,
  });
  res.status(200).json(movieLibraries);
});

movieRoutes.get('/newest', async (req, res, next) => {
  logger.debug('Get newest movies endpoint called', {
    label: 'API',
    userId: req.user?.id,
    query: req.query.query,
    genre: req.query.genre,
    sortBy: req.query.sortBy,
    page: req.query.page,
    ip: req.ip,
  });
  const plexUrl = getPlexUrl();
  try {
    const movieLibraries = await getLibraries('movie', req.user?.id);
    const settings = getSettings();
    const libID =
      settings.main.defaultMovieLibrary === 'Not Defined'
        ? movieLibraries[0].id
        : settings.main.defaultMovieLibrary;

    const query = req.query.query as string;
    const genre = req.query.genre as string;
    const sortBy = req.query.sortBy as string;
    logger.debug('Fetching movies from library', {
      label: 'API',
      libraryId: libID,
      userId: req.user?.id,
    });

    const userRepository = getRepository(User);
    const admin = await userRepository.findOneOrFail({
      select: { id: true, plexToken: true },
      where: { id: 1 },
    });

    const itemsPerPage = 10;
    const page = Number(req.query.page) ?? 1;
    const offset = (page - 1) * itemsPerPage;

    const plexapi = new PlexAPI({ plexToken: admin.plexToken });

    const result = await plexapi.getLibraryContents(libID, {
      offset,
      size: itemsPerPage,
      filter: query,
      genre,
      sortBy,
    });
    const machineID = await plexapi.getIdentity();

    logger.info('Movies retrieved successfully', {
      label: 'API',
      libraryId: libID,
      totalResults: result.totalSize,
      page,
      totalPages: Math.ceil(result.totalSize / itemsPerPage),
      userId: req.user?.id,
    });

    return res.status(200).json({
      page,
      totalPages: Math.ceil(result.totalSize / itemsPerPage),
      totalResults: result.totalSize,
      results: result.items.map((item) => ({
        ratingKey: item.ratingKey,
        url: `${plexUrl}/web/index.html#!/server/${machineID.machineIdentifier}/details?key=/library/metadata/${item.ratingKey}`,
        title: item.title,
        mediaType: 'movie',
        thumb: item.thumb,
        summary: item.summary,
      })),
    });
  } catch (e) {
    logger.error('Failed to retrieve movies', {
      label: 'API',
      error: e.message,
      userId: req.user?.id,
      ip: req.ip,
    });
    next({ status: 404, message: 'User not found.' });
  }
});

export default movieRoutes;
