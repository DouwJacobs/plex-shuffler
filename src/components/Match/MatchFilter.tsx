import Button from '@app/components/Common/Button';
import Modal from '@app/components/Common/Modal';
import { Transition } from '@headlessui/react';
import {
  BarsArrowDownIcon,
  FunnelIcon,
  PaintBrushIcon,
} from '@heroicons/react/24/outline';
import { Fragment, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  discovermovies: 'Movies',
  activefilters:
    '{count, plural, one {# Active Filter} other {# Active Filters}}',
  sortPopularityAsc: 'Popularity Ascending',
  sortPopularityDesc: 'Popularity Descending',
  sortReleaseDateAsc: 'Release Date Ascending',
  sortReleaseDateDesc: 'Release Date Descending',
  sortTmdbRatingAsc: 'TMDB Rating Ascending',
  sortTmdbRatingDesc: 'TMDB Rating Descending',
  sortTitleAsc: 'Title (A-Z) Ascending',
  sortTitleDesc: 'Title (Z-A) Descending',
});

type SortOptions =
  | 'userRating:asc'
  | 'userRating:desc'
  | 'originallyAvailableAt:asc'
  | 'originallyAvailableAt:desc'
  | 'revenue.asc'
  | 'revenue.desc'
  | 'primary_release_date.asc'
  | 'primary_release_date.desc'
  | 'titleSort'
  | 'titleSort:desc'
  | 'rating:asc'
  | 'rating:desc'
  | 'vote_count.asc'
  | 'vote_count.desc'
  | 'first_air_date.asc'
  | 'first_air_date.desc';

const MatchFilter = ({
  type,
  genre,
  sortBy,
  setType,
  setGenre,
  setSortBy,
}: {
  type: string;
  genre: string;
  sortBy: string;
  setType: (val: string) => void;
  setGenre: (val: string) => void;
  setSortBy: (val: string) => void;
}) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const intl = useIntl();

  const SortOptions: Record<string, SortOptions> = {
    PopularityAsc: 'userRating:asc',
    PopularityDesc: 'userRating:desc',
    ReleaseDateAsc: 'originallyAvailableAt:asc',
    ReleaseDateDesc: 'originallyAvailableAt:desc',
    TmdbRatingAsc: 'rating:asc',
    TmdbRatingDesc: 'rating:desc',
    TitleAsc: 'titleSort',
    TitleDesc: 'titleSort:desc',
  } as const;
  return (
    <div className="relative">
      <Button onClick={() => setModalOpen(true)}>
        <FunnelIcon />
        <span>Filter</span>
      </Button>
      <Transition
        as={Fragment}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        show={isModalOpen}
      >
        <Modal
          title={'Filters'}
          okText={'Close'}
          onOk={() => setModalOpen(false)}
        >
          <div className="flex">
            <span className="plex-bg-transparent inline-flex h-11 cursor-default items-center rounded-l-md border border-r-0 border-gray-500 px-3 text-sm">
              <FunnelIcon className="h-6 w-6" />
            </span>
            <select
              id="typeFilter"
              name="typeFilter"
              onChange={(e) => {
                setType(e.target.value as string);
              }}
              value={type}
              className="rounded-r-only h-11"
            >
              <option value="movies">{'Movies'}</option>
              <option value="tv">{'TV Shows'}</option>
            </select>
          </div>
          <div className="mt-2 flex">
            <span className="plex-bg-transparent inline-flex h-11 cursor-default items-center rounded-l-md border border-r-0 border-gray-500 px-3 text-sm">
              <BarsArrowDownIcon className="h-6 w-6" />
            </span>
            <select
              id="sortBy"
              name="sortBy"
              className="rounded-r-only"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value={SortOptions.PopularityDesc}>
                {intl.formatMessage(messages.sortPopularityDesc)}
              </option>
              <option value={SortOptions.PopularityAsc}>
                {intl.formatMessage(messages.sortPopularityAsc)}
              </option>
              <option value={SortOptions.ReleaseDateDesc}>
                {intl.formatMessage(messages.sortReleaseDateDesc)}
              </option>
              <option value={SortOptions.ReleaseDateAsc}>
                {intl.formatMessage(messages.sortReleaseDateAsc)}
              </option>
              <option value={SortOptions.TmdbRatingDesc}>
                {intl.formatMessage(messages.sortTmdbRatingDesc)}
              </option>
              <option value={SortOptions.TmdbRatingAsc}>
                {intl.formatMessage(messages.sortTmdbRatingAsc)}
              </option>
              <option value={SortOptions.TitleAsc}>
                {intl.formatMessage(messages.sortTitleAsc)}
              </option>
              <option value={SortOptions.TitleDesc}>
                {intl.formatMessage(messages.sortTitleDesc)}
              </option>
            </select>
          </div>
          <div className="mt-2 flex">
            <span className="plex-bg-transparent inline-flex h-11 cursor-default items-center rounded-l-md border border-r-0 border-gray-500 px-3 text-sm">
              <PaintBrushIcon className="h-6 w-6" />
            </span>
            <select
              id="genreFilter"
              name="genreFilter"
              onChange={(e) => {
                setGenre(e.target.value as string);
              }}
              value={genre}
              className="rounded-r-only h-11"
            >
              <option value="all">{'All'}</option>
              <option value="5">{'Action'}</option>
              <option value="6">{'Adventure'}</option>
              <option value="763">{'Animation'}</option>
              <option value="11577">{'Biography'}</option>
              <option value="570">{'Comedy'}</option>
              <option value="680">{'Crime'}</option>
              <option value="7">{'Drama'}</option>
              <option value="679">{'Family'}</option>
              <option value="10">{'Fantasy'}</option>
              <option value="236">{'Horror'}</option>
              <option value="26498">{'Martial Arts'}</option>
              <option value="3149">{'Musical'}</option>
              <option value="681">{'Mystery'}</option>
              <option value="272">{'Romance'}</option>
              <option value="9976">{'Sport'}</option>
              <option value="764">{'Thriller'}</option>
              <option value="1943">{'War'}</option>
              <option value="3575">{'Western'}</option>
            </select>
          </div>
        </Modal>
      </Transition>
    </div>
  );
};

export default MatchFilter;
