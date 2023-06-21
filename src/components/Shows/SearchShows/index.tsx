import Header from '@app/components/Common/Header';
import ListView from '@app/components/Common/ListView';
import PageTitle from '@app/components/Common/PageTitle';
import SearchInput from '@app/components/Common/SearchInput';
import useListLoading from '@app/hooks/useListLoading';
import Error from '@app/pages/_error';
import type { PlaylistResult } from '@server/models/Search';
import { useRouter } from 'next/router';
import { defineMessages, useIntl } from 'react-intl';

export const messages = defineMessages({
  search: 'TV Shows Search',
  searchresults: 'TV Shows',
  showPlaceholder: 'Search TV Shows',
});

const SearchShows = () => {
  const intl = useIntl();
  const router = useRouter();

  const {
    isLoadingInitialData,
    isEmpty,
    isLoadingMore,
    isReachingEnd,
    titles,
    fetchMore,
    error,
  } = useListLoading<PlaylistResult>(`/api/v1/tv/shows`, {
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
        searchPlaceholder={intl.formatMessage(messages.showPlaceholder)}
        endPoint="shows"
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

export default SearchShows;
