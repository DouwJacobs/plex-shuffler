import Button from '@app/components/Common/Button';
import Card from '@app/components/Common/Card';
import Header from '@app/components/Common/Header';
import LoadingSpinner from '@app/components/Common/LoadingSpinner';
import PageTitle from '@app/components/Common/PageTitle';
import MatchFilter from '@app/components/Match/MatchFilter';
import { messages } from '@app/components/Match/MatchRedirect';
import MatchUsers from '@app/components/Match/MatchUsers';
import SwapableCard from '@app/components/Match/SwapableCard';
import { useUser } from '@app/hooks/useUser';
import { socket } from '@app/utils/socketio';
import { ClipboardDocumentIcon, LinkIcon } from '@heroicons/react/24/outline';
import type { SocketUser } from '@server/socketio/utils';
import copy from 'copy-to-clipboard';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useIntl } from 'react-intl';
import { RWebShare } from 'react-web-share';
import useSWR from 'swr';

const Match = () => {
  const intl = useIntl();
  const router = useRouter();
  const { user } = useUser();
  const [sessionUsers, setSessionUsers] = useState<SocketUser[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastChoice, setLastChoice] = useState<string>();
  const [matches, setMatches] = useState<string[]>([]);
  const [matchType, setMatchType] = useState('tv');
  const [first, setFirst] = useState<boolean>(false);

  const matchID = router.query.matchID;

  useEffect(() => {
    socket.emit('user_entered_session', {
      name: user?.displayName,
      room: matchID,
    });

    return () => {
      socket.off('user_entered_session');
    };
  }, [user, matchID]);

  useEffect(() => {
    socket.on('session_users', (data) => {
      setSessionUsers(data);
      const currentUser = data.filter((dataItem: SocketUser) => {
        return user?.displayName === dataItem.name;
      });
      setFirst(currentUser[0].first);
    });

    return () => {
      socket.off('session_users');
    };
  }, [sessionUsers, first, user]);

  useEffect(() => {
    if (lastChoice) {
      socket.emit('addUserChoice', matchID, lastChoice);
      return () => {
        socket.off('addUserChoice');
      };
    }
  }, [lastChoice, matchID]);

  useEffect(() => {
    socket.on('setMatches', (roomMatches) => {
      setMatches(roomMatches);
    });
    return () => {
      socket.off('setMatches');
    };
  }, [matches]);

  useEffect(() => {
    socket.emit('changeType', { room: matchID, type: matchType });
    socket.on('setType', (data) => {
      setMatchType(data);
    });
    return () => {
      socket.off('changeType');
      socket.off('setType');
    };
  }, [matchType, matchID]);

  const { data, error } = useSWR(
    `/api/v1/${matchType}/${
      matchType === 'tv' ? 'shows' : 'newest'
    }?page=${currentPage}`
  );

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  if (!data) {
    return <LoadingSpinner />;
  }

  const addSelected = (ratingKey: string) => {
    setLastChoice(ratingKey);
  };

  const copySessionID = () => {
    copy(matchID as string);
    toast.success(intl.formatMessage(messages.copiedSessionMessage));
  };

  return (
    <div className="z-10">
      <PageTitle title={intl.formatMessage(messages.match)} />
      <div className="mb-5 mt-1">
        <Header>{intl.formatMessage(messages.match)}</Header>
      </div>
      <Card className="m-2 m-auto w-full p-5 ">
        <div className="flex-grow items-center justify-between text-center md:flex md:flex-wrap">
          <span className="inline-flex cursor-default items-center gap-2 px-3 text-sm text-gray-100">
            <RWebShare
              data={{
                text: 'Join Matchflix Session',
                url: window.location.href,
                title: 'Matchflix',
              }}
            >
              <Button buttonType="primary">
                <LinkIcon /> Share this session
              </Button>
            </RWebShare>
            <Button buttonType="primary" type="button" onClick={copySessionID}>
              <ClipboardDocumentIcon /> Copy Session ID
            </Button>
          </span>
          <span className="mt-2 inline-flex cursor-default items-center justify-end gap-2 px-3 text-sm text-gray-100 md:mt-0">
            <Button
              buttonType="primary"
              onClick={() =>
                router.push({
                  pathname: '/match/[matchID]/matches',
                  query: { matchID, ratingKeys: matches },
                })
              }
              disabled={matches.length === 0}
            >
              Matches ({matches.length})
            </Button>
            <MatchUsers sessionUsers={sessionUsers} />
            {first && <MatchFilter type={matchType} setType={setMatchType} />}
          </span>
        </div>
      </Card>

      <SwapableCard
        data={data.results}
        addSelected={addSelected}
        updatePage={() => {
          setCurrentPage((page) => page + 1);
        }}
      />
    </div>
  );
};

export default Match;
