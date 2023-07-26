import shuffle from '@server/utils/shuffle';
import weighted from 'weighted';

interface Show {
  ratingKey: string;
  episodes: string[];
}

const plexShuffle = (allEpisodes: Show[]) => {
  const shuffledEpisodes: any[] = [];

  if (allEpisodes.length === 1) {
    shuffle(allEpisodes[0].episodes).map((episode) =>
      shuffledEpisodes.push(episode)
    );

    return shuffledEpisodes;
  }

  while (allEpisodes.length > 0) {
    const totalEpisodes = allEpisodes.reduce(
      (count, current) => count + current.episodes.length,
      0
    );

    const weights: any = {};

    allEpisodes.map((show) => {
      weights[show.ratingKey.toString()] = show.episodes.length / totalEpisodes;
    });

    const currentShow = weighted.select(weights);
    const currentIndex = allEpisodes.findIndex(
      (show) => show.ratingKey === currentShow
    );
    const currentEpisode = allEpisodes[currentIndex].episodes[0];

    shuffledEpisodes.push(currentEpisode);

    allEpisodes[currentIndex].episodes.shift();

    if (allEpisodes[currentIndex].episodes.length === 0) {
      allEpisodes = allEpisodes.filter(
        (show) => show !== allEpisodes[currentIndex]
      );
    }
  }

  return shuffledEpisodes;
};

export default plexShuffle;
