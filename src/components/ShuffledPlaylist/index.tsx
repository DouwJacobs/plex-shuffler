import Header from '@app/components/Common/Header';
import PageTitle from '@app/components/Common/PageTitle';
import CreatePlaylist from '@app/components/ShuffledPlaylist/CreatePlaylist';
// import SearchInput from '@app/components/Common/SearchInput';
import { useRouter } from 'next/router';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  shuffledplaylists: 'Shuffled Playlist',
  createplaylist: 'Create Shuffled Playlist',
});

const ShuffledPlaylist = () => {
  const intl = useIntl();
  const router = useRouter();

  return (
    <>
      <PageTitle title={intl.formatMessage(messages.shuffledplaylists)} />
      <div className="mb-5 mt-1">
        <Header>{intl.formatMessage(messages.createplaylist)}</Header>
      </div>
      {/* <SearchInput
        searchPlaceholder={intl.formatMessage(messages.showPlaceholder)}
        endPoint="shows"
      /> */}
      <CreatePlaylist onComplete={() => router.push('/')} />
    </>
  );
};

export default ShuffledPlaylist;
