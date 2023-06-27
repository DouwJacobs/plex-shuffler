import CachedImage from '@app/components/Common/CachedImage';
import Card from '@app/components/Common/Card';
import Checkbox from '@app/components/Common/Checkbox';
import LoadingSpinner from '@app/components/Common/LoadingSpinner';
import ErrorCard from '@app/components/Common/TitleCard/ErrorCard';
import Placeholder from '@app/components/Common/TitleCard/Placeholder';
import { withProperties } from '@app/utils/typeHelpers';
import { useState } from 'react';

type PlaylistCardProps = {
  title: string;
  thumb: string;
  handleOnchange?: () => void;
  selected?: boolean;
  ratingKey?: string;
};

const TitleCard = (props: PlaylistCardProps) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Card
      className="h-full transform text-center text-white transition duration-100
    hover:scale-110 sm:w-36 md:w-44"
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
            <CachedImage
              alt={props.title}
              src={props.thumb}
              onLoad={() => {
                setIsLoading(false);
              }}
            />
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
    </Card>
  );
};

export default withProperties(TitleCard, { Placeholder, ErrorCard });
