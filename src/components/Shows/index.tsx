import Header from "@app/components/Common/Header";
import ListView from "@app/components/Common/ListView";
import PageTitle from "@app/components/Common/PageTitle";
import useDiscover from "@app/hooks/useListLoading";
import Error from "@app/pages/_error";
import globalMessages from "@app/i18n/globalMessages";
import type { ShowResult } from "@server/models/Search";
import SearchInput from "../Common/SearchInput";
import {messages} from "./SearchShows";
import { useIntl } from "react-intl";

const Shows = () => {
  const intl = useIntl();

  const {
    isLoadingInitialData,
    isEmpty,
    isLoadingMore,
    isReachingEnd,
    titles,
    fetchMore,
    error,
  } = useDiscover<ShowResult>("/api/v1/tv/shows");

  if (error) {
    return <Error statusCode={500} />;
  }

  return (
    <>
      <PageTitle title={intl.formatMessage(messages.search)} />
      <div className="mt-1 mb-5">
        <Header>{intl.formatMessage(messages.searchresults)}</Header>
      </div>
      <SearchInput searchPlaceholder={intl.formatMessage(messages.showPlaceholder)} endPoint="shows"/>
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

export default Shows;