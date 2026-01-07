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
  const shuffledEpisodes: string[] = [];

  if (allEpisodes.length === 1) {
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

  while (showStates.length > 0) {
    // Only recalculate weights when needed (more efficient than every iteration)
    const weights: Record<string, number> = {};
    for (const state of showStates) {
      const remainingEpisodes =
        state.totalEpisodes - state.currentIndex;
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
    const currentEpisode =
      selectedShow.episodes[selectedShow.currentIndex];
    shuffledEpisodes.push(currentEpisode);

    // Move to next episode
    selectedShow.currentIndex++;
    totalEpisodes--;

    // If show is exhausted, remove it efficiently
    if (
      selectedShow.currentIndex >= selectedShow.totalEpisodes
    ) {
      const indexToRemove = showStates.findIndex(
        (state) => state.ratingKey === selectedRatingKey
      );
      if (indexToRemove !== -1) {
        showStates.splice(indexToRemove, 1);
        showMap.delete(String(selectedRatingKey));
      }
    }
  }

  return shuffledEpisodes;
};

export default plexShuffle;
