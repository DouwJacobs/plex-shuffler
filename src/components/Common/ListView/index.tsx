import TitleCard from "@app/components/Common/TitleCard";
import useVerticalScroll from "@app/hooks/useVerticalScroll";
import globalMessages from "@app/i18n/globalMessages";
import type { ShowResult, PlaylistResult } from "@server/models/Search";
import noCover from "@app/assets/images/playlist-no-cover.png";
import { useIntl } from "react-intl";

type ListViewProps = {
  items?: (ShowResult | PlaylistResult)[];
  isEmpty?: boolean;
  isLoading?: boolean;
  isReachingEnd?: boolean;
  onScrollBottom: () => void;
};

const ListView = ({
  items,
  isEmpty,
  isLoading,
  onScrollBottom,
  isReachingEnd,
}: ListViewProps) => {
  const intl = useIntl();
  useVerticalScroll(onScrollBottom, !isLoading && !isEmpty && !isReachingEnd);
  return (
    <>
      {isEmpty && (
        <div className="mt-64 w-full text-center text-2xl text-gray-400">
          {intl.formatMessage(globalMessages.noresults)}
        </div>
      )}
      <ul className="cards-vertical lg:pr-2">
        {items?.map((title, index) => {
          let titleCard: React.ReactNode;

          switch (title.mediaType) {
            case "tv":
              titleCard = (
                <TitleCard
                  title={title.title}
                  thumb={
                    title.thumb
                      ? title.thumb
                      : noCover.src
                  }
                />
              );
              break;
            case "playlist":
              titleCard = (
                <TitleCard
                  title={title.title}
                  thumb={
                    title.thumb
                      ? title.thumb
                      : noCover.src
                  }
                />
              );
              break;
          }

          return <li key={`${title.ratingKey}-${index}`}>{titleCard}</li>;
        })}
        {isLoading &&
          !isReachingEnd &&
          [...Array(20)].map((_item, i) => (
            <li key={`placeholder-${i}`}>
              <TitleCard.Placeholder canExpand />
            </li>
          ))}
      </ul>
    </>
  );
};

export default ListView;