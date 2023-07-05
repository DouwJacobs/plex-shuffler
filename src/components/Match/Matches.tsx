import Header from '@app/components/Common/Header';
import ListView from '@app/components/Common/ListView';
import PageTitle from '@app/components/Common/PageTitle';
import useListLoading from '@app/hooks/useListLoading';
import Error from '@app/pages/_error';
import type { ShowResult } from '@server/models/Search';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';
import { messages } from './MatchRedirect';

const Matches = () => {
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
  } = useListLoading<ShowResult>('/api/v1/matchflix/matches', {
    ratingKeys: router.query.ratingKeys,
  });

  if (error) {
    return <Error statusCode={500} />;
  }

  return (
    <>
      <PageTitle title={intl.formatMessage(messages.match)} />
      <div className="mb-5 mt-1">
        <Header>{intl.formatMessage(messages.match)}</Header>
      </div>
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

export default Matches;
