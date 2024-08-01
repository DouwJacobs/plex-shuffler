import { getRepository } from '@server/datasource';
import { PlaylistShows } from '@server/entity/PlaylistShows';
import type { TVShow } from './scanners/plexScanner';

export const updateShowEpisodes = async (allEpisodes: TVShow[]) => {
  const showsRepository = getRepository(PlaylistShows);
  let totalUnwatchedEpisodes = 0;
  let totalEpisodes = 0;
  const showEnitities: PlaylistShows[] = [];
  await Promise.all(
    allEpisodes.map(async (show) => {
      const currentShow = await showsRepository.findOne({
        where: { ratingKey: show.ratingKey },
      });

      if (currentShow) {
        currentShow.numEpisodes = show.totalEpisodes;
        showEnitities.push(currentShow);

        await showsRepository.save(currentShow);
      } else {
        const newShow = new PlaylistShows();
        newShow.ratingKey = show.ratingKey;
        newShow.numEpisodes = show.totalEpisodes;
        showEnitities.push(newShow);

        await showsRepository.save(newShow);
      }

      totalUnwatchedEpisodes += show.totalUnwatched;
      totalEpisodes += show.totalEpisodes;
    })
  );

  return { totalUnwatchedEpisodes, totalEpisodes, showEnitities };
};
