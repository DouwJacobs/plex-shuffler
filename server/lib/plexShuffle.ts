import logger from '@server/logger';
import shuffle from '@server/utils/shuffle';
import weighted from 'weighted';

interface Show {
  ratingKey: string;
  episodes: string[];
}

interface ShowState {
  ratingKey: string;
  episodes: string[];
  currentIndex: number;
  totalEpisodes: number;
}

const plexShuffle = (allEpisodes: Show[]) => {
  logger.debug('Starting playlist shuffle', {
    label: 'PlexShuffle',
    showCount: allEpisodes.length,
    totalEpisodes: allEpisodes.reduce(
      (sum, show) => sum + show.episodes.length,
      0
    ),
  });
  const shuffledEpisodes: string[] = [];

  if (allEpisodes.length === 1) {
    logger.debug('Single show shuffle - using simple shuffle', {
      label: 'PlexShuffle',
      showRatingKey: allEpisodes[0].ratingKey,
      episodeCount: allEpisodes[0].episodes.length,
    });
    return shuffle([...allEpisodes[0].episodes]);
  }

  // Initialize show states with index tracking (avoids expensive shift() operations)
  const showStates: ShowState[] = allEpisodes.map((show) => ({
    ratingKey: show.ratingKey,
    episodes: show.episodes,
    currentIndex: 0,
    totalEpisodes: show.episodes.length,
  }));

  // Create a Map for O(1) lookups by ratingKey
  const showMap = new Map<string, ShowState>();
  showStates.forEach((state) => {
    showMap.set(state.ratingKey, state);
  });

  // Calculate total episodes once
  let totalEpisodes = showStates.reduce(
    (sum, state) => sum + state.totalEpisodes,
    0
  );

  logger.debug('Multi-show weighted shuffle initialized', {
    label: 'PlexShuffle',
    showCount: showStates.length,
    totalEpisodes,
  });

  let iterationCount = 0;
  while (showStates.length > 0) {
    iterationCount++;
    // Only recalculate weights when needed (more efficient than every iteration)
    const weights: Record<string, number> = {};
    for (const state of showStates) {
      const remainingEpisodes = state.totalEpisodes - state.currentIndex;
      if (remainingEpisodes > 0) {
        weights[state.ratingKey] = remainingEpisodes / totalEpisodes;
      }
    }

    // Select a show using weighted selection
    const selectedRatingKey = String(weighted.select(weights));
    const selectedShow = showMap.get(selectedRatingKey);

    if (!selectedShow) {
      // Safety check (shouldn't happen, but prevents crashes)
      break;
    }

    // Get the current episode using index (O(1) instead of shift() which is O(n))
    const currentEpisode = selectedShow.episodes[selectedShow.currentIndex];
    shuffledEpisodes.push(currentEpisode);

    // Move to next episode
    selectedShow.currentIndex++;
    totalEpisodes--;

    // If show is exhausted, remove it efficiently
    if (selectedShow.currentIndex >= selectedShow.totalEpisodes) {
      logger.debug('Show exhausted, removing from shuffle', {
        label: 'PlexShuffle',
        ratingKey: selectedRatingKey,
        remainingShows: showStates.length - 1,
      });
      const indexToRemove = showStates.findIndex(
        (state) => state.ratingKey === selectedRatingKey
      );
      if (indexToRemove !== -1) {
        showStates.splice(indexToRemove, 1);
        showMap.delete(String(selectedRatingKey));
      }
    }
  }

  logger.info('Playlist shuffle completed', {
    label: 'PlexShuffle',
    totalEpisodes: shuffledEpisodes.length,
    iterations: iterationCount,
    showCount: allEpisodes.length,
  });

  return shuffledEpisodes;
};

export default plexShuffle;
