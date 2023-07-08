import PlexAPI from '@server/api/plexapi';
import { getRepository } from '@server/datasource';
import { User } from '@server/entity/User';
import { getPlexUrl } from '@server/utils';
import { Router } from 'express';

const matchflixRoutes = Router();

matchflixRoutes.get('/matches', async (req, res, next) => {
  const plexUrl = getPlexUrl();
  try {
    const ratingKeys = decodeURIComponent(req.query.ratingKeys as string);

    const userRepository = getRepository(User);
    const admin = await userRepository.findOneOrFail({
      select: { id: true, plexToken: true },
      where: { id: 1 },
    });

    const page = Number(req.query.page) ?? 1;

    const plexapi = new PlexAPI({ plexToken: admin.plexToken });

    const result = await plexapi.getMultipleMetadata(ratingKeys);
    const machineID = await plexapi.getIdentity();

    return res.status(200).json({
      page,
      totalPages: 1,
      totalResults: result.size,
      results: result.Metadata.map((item) => ({
        ratingKey: item.ratingKey,
        url: `${plexUrl}/web/index.html#!/server/${machineID.machineIdentifier}/details?key=/library/metadata/${item.ratingKey}`,
        title: item.title,
        mediaType: item.type === 'show' ? 'tv' : item.type,
        thumb: item.thumb,
        summary: item.summary,
      })),
    });
  } catch (e) {
    next({ status: 404, message: 'User not found.' });
  }
});

export default matchflixRoutes;
