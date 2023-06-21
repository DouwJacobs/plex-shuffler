import Header from '@app/components/Common/Header';
import ListView from '@app/components/Common/ListView';
import PageTitle from '@app/components/Common/PageTitle';
import SearchInput from '@app/components/Common/SearchInput';
import useListLoading from '@app/hooks/useListLoading';
import Error from '@app/pages/_error';
import type { PlaylistResult } from '@server/models/Search';
import { useRouter } from 'next/router';
import { defineMessages, useIntl } from 'react-intl';
import useSWR from 'swr';

export const messages = defineMessages({
  search: 'Playlists Search',
  searchresults: 'Search Results',
  playlistPlaceholder: 'Search Playlists',
  playlists: 'Playlists',
});

const SearchPlaylists = () => {
  const intl = useIntl();
  const router = useRouter();
  const { data: user } = useSWR('/api/v1/auth/me/token');

  const {
    isLoadingInitialData,
    isEmpty,
    isLoadingMore,
    isReachingEnd,
    titles,
    fetchMore,
    error,
  } = useListLoading<PlaylistResult>(`/api/v1/user/${user?.id}/playlists`, {
    query: router.query.query,
  });

  if (error) {
    return <Error statusCode={500} />;
  }

  return (
    <>
      <PageTitle title={intl.formatMessage(messages.search)} />
      <div className="mb-5 mt-1">
        <Header>{intl.formatMessage(messages.searchresults)}</Header>
      </div>
      <SearchInput
        searchPlaceholder={intl.formatMessage(messages.playlistPlaceholder)}
        endPoint={`user/playlists`}
      />
      <ListView
        items={titles}
        isEmpty={isEmpty}
        isLoading={
          isLoadingInitialData || (isLoadingMore && (titles?.length ?? 0) > 0)
        }
        isReachingEnd={isReachingEnd}
        onScrollBottom={fetchMore}
      />
    </>
  );
};

export default SearchPlaylists;
