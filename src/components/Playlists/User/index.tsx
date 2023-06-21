import Header from "@app/components/Common/Header";
import ListView from "@app/components/Common/ListView";
import PageTitle from "@app/components/Common/PageTitle";
import useDiscover from "@app/hooks/useListLoading";
import Error from "@app/pages/_error";
import globalMessages from "@app/i18n/globalMessages";
import type { PlaylistResult } from "@server/models/Search";
import { useUser } from "@app/hooks/useUser";
import SearchInput from "@app/components/Common/SearchInput";
import { useIntl } from "react-intl";
import { messages } from "../Search";

const UserPlaylists = () => {
  const { user } = useUser();
  const intl = useIntl();

  const {
    isLoadingInitialData,
    isEmpty,
    isLoadingMore,
    isReachingEnd,
    titles,
    fetchMore,
    error,
  } = useDiscover<PlaylistResult>(`/api/v1/user/${user?.id}/playlists`);

  if (error) {
    return <Error statusCode={500} />;
  }

  const displayName = user?.displayName.charAt(user?.displayName.length - 1).toLowerCase() === 's' ? user?.displayName + "' " : user?.displayName + "'s "

  return (
    <>
      <PageTitle title={intl.formatMessage(messages.playlists)} />
      <div className="mt-1 mb-5">
        <Header>{displayName + intl.formatMessage(messages.playlists)}</Header>
      </div>
      <SearchInput searchPlaceholder={intl.formatMessage(messages.playlistPlaceholder)} endPoint={`user/playlists`}/>
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

export default UserPlaylists;