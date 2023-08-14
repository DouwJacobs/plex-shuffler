import PlexAPI from '@server/api/plexapi';
import { getRepository } from '@server/datasource';
import { User } from '@server/entity/User';
import { getLibraries, getSettings } from '@server/lib/settings';
import { getPlexUrl } from '@server/utils';
import { Router } from 'express';

const movieRoutes = Router();

movieRoutes.get('/libraries', (req, res) => {
  const movieLibraries = getLibraries('movie');
  res.status(200).json(movieLibraries);
});

movieRoutes.get('/newest', async (req, res, next) => {
  const plexUrl = getPlexUrl();
  try {
    const movieLibraries = getLibraries('movie');
    const settings = getSettings();
    const libID =
      settings.main.defaultMovieLibrary === 'Not Defined'
        ? movieLibraries[0].id
        : settings.main.defaultMovieLibrary;

    const query = req.query.query as string;
    const genre = req.query.genre as string;
    const sortBy = req.query.sortBy as string;

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
    next({ status: 404, message: 'User not found.' });
  }
});

export default movieRoutes;
