import CachedImage from '@app/components/Common/CachedImage';
import Card from '@app/components/Common/Card';
import Checkbox from '@app/components/Common/Checkbox';
import LoadingSpinner from '@app/components/Common/LoadingSpinner';
import ErrorCard from '@app/components/Common/TitleCard/ErrorCard';
import Placeholder from '@app/components/Common/TitleCard/Placeholder';
import { useIsTouch } from '@app/hooks/useIsTouch';
import { withProperties } from '@app/utils/typeHelpers';
import { useState } from 'react';

type PlaylistCardProps = {
  title: string;
  thumb: string;
  handleOnchange?: () => void;
  selected?: boolean;
  ratingKey?: string;
  url?: string;
};

const TitleCard = (props: PlaylistCardProps) => {
  const isTouch = useIsTouch();
  const [isLoading, setIsLoading] = useState(true);
  const [boop, setBoop] = useState(false);

  return (
    <Card
      className={`h-full cursor-default text-center text-white transition duration-300 sm:w-36 md:w-44 ${
        boop ? 'scale-105 shadow-lg' : 'scale-100 shadow'
      }`}
    >
      <div
        onMouseEnter={() => {
          if (!isTouch) {
            setBoop(true);
          }
        }}
        onMouseLeave={() => setBoop(false)}
      >
        <div className="m-2 pt-2">
          {isLoading && (
            <div>
              <LoadingSpinner className="h-full" />
            </div>
          )}

          <div className={`checkbox-card ${isLoading && 'hidden'}`}>
            {props.handleOnchange ? (
              <Checkbox
                selected={props.selected}
                handleOnchange={props.handleOnchange}
                id={props.ratingKey}
              />
            ) : null}
            <label htmlFor={props.ratingKey}>
              {props.handleOnchange ? (
                <CachedImage
                  alt={props.title}
                  src={props.thumb}
                  onLoad={() => {
                    setIsLoading(false);
                  }}
                />
              ) : (
                <a href={props.url} target="_blank" rel="noreferrer">
                  <CachedImage
                    alt={props.title}
                    src={props.thumb}
                    onLoad={() => {
                      setIsLoading(false);
                    }}
                  />
                </a>
              )}
            </label>
          </div>
        </div>
        <h1
          className="text-l whitespace-normal font-bold leading-tight text-white"
          style={{
            WebkitLineClamp: 3,
            display: '-webkit-box',
            overflow: 'hidden',
            WebkitBoxOrient: 'vertical',
            wordBreak: 'break-word',
          }}
        >
          {props.title}
        </h1>
      </div>
    </Card>
  );
};

export default withProperties(TitleCard, { Placeholder, ErrorCard });
