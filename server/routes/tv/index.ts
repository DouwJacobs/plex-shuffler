import PlexAPI from '@server/api/plexapi';
import { getRepository } from '@server/datasource';
import { User } from '@server/entity/User';
import { getLibraries, getSettings } from '@server/lib/settings';
import { getPlexUrl } from '@server/utils';
import { Router } from 'express';

const tvRoutes = Router();

tvRoutes.get('/libraries', async (req, res) => {
  const tvLibraries = await getLibraries('show', req.user?.id);
  res.status(200).json(tvLibraries);
});

tvRoutes.get('/shows', async (req, res, next) => {
  const plexUrl = getPlexUrl();

  const userRepository = getRepository(User);

  if (!req.user) {
    return res.status(500).json({
      status: 500,
      error: 'Please sign in.',
    });
  }

  const user = await userRepository.findOneOrFail({
    where: { id: req.user.id },
  });

  try {
    const settings = getSettings();
    const tvLibraries = await getLibraries('show');
    const libID = user.settings?.userDefaultShowLibraryID
      ? user.settings?.userDefaultShowLibraryID
      : settings.main.defaultShowLibrary === 'Not Defined'
      ? tvLibraries[0].id
      : settings.main.defaultShowLibrary;

    const query = req.query.query as string;
    const genre = req.query.genre as string;
    const sortBy = req.query.sortBy as string;

    const admin = await userRepository.findOneOrFail({
      select: { id: true, plexToken: true },
      where: { id: 1 },
    });

    const itemsPerPage = 20;
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
        mediaType: 'tv',
        thumb: item.thumb,
        summary: item.summary,
      })),
    });
  } catch (e) {
    next({ status: 404, message: 'User not found.' });
  }
});

export default tvRoutes;
