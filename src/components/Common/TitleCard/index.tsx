import Card from "@app/components/Common/Card";
import LoadingSpinner from "@app/components/Common/LoadingSpinner";
import { useState } from "react";
import CachedImage from "@app/components/Common/CachedImage";
import ErrorCard from "@app/components/Common/TitleCard/ErrorCard";
import Placeholder from "@app/components/Common/TitleCard/Placeholder";
import { withProperties } from "@app/utils/typeHelpers";

type PlaylistCardProps = {
  title: string;
  thumb: string;
};

const TitleCard = (props: PlaylistCardProps) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Card className="h-full sm:w-36 md:w-44 text-center text-white zoom">
      <div className="m-2 pt-2">
        {isLoading && (
          <div>
            <LoadingSpinner className="h-full" />
          </div>
        )}

        <CachedImage
          className={`${isLoading && "hidden"}`}
          alt={props.title}
          src={props.thumb}
          onLoad={() => {
            setIsLoading(false);
          }}
        />
      </div>
      <h1
        className="whitespace-normal text-l font-bold leading-tight text-white"
        style={{
          WebkitLineClamp: 3,
          display: "-webkit-box",
          overflow: "hidden",
          WebkitBoxOrient: "vertical",
          wordBreak: "break-word",
        }}
      >
        {props.title}
      </h1>
    </Card>
  );
};

export default withProperties(TitleCard, { Placeholder, ErrorCard });
