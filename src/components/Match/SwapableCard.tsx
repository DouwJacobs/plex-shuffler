import Card from '@app/components/Common/Card';
import dynamic from 'next/dynamic';
import React, { useMemo, useRef, useState } from 'react';
const TinderCard = dynamic(() => import('react-tinder-card'), {
  ssr: false,
});

function SwapableCard({
  data,
  addSelected,
  updatePage,
}: {
  data: any;
  addSelected: (ratingKey: string) => void;
  updatePage: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(data.length - 1);
  const [lastDirection, setLastDirection] = useState('');
  // used for outOfFrame closure
  const currentIndexRef = useRef(currentIndex);

  const childRefs: any = useMemo(
    () =>
      Array(data.length)
        .fill(0)
        .map(() => React.createRef()),
    [data.length]
  );

  const updateCurrentIndex = (val: number) => {
    setCurrentIndex(val);
    currentIndexRef.current = val;
  };

  // set last direction and decrease current index
  const swiped = (direction: string, index: number, ratingKey: string) => {
    setLastDirection(direction);
    updateCurrentIndex(index - 1);
    if (direction === 'right') {
      addSelected(ratingKey);
    }

    if (currentIndex <= 0) {
      updatePage();
    }
  };

  const outOfFrame = (name: string, idx: number) => {
    // handle the case in which go back is pressed before card goes outOfFrame
    currentIndexRef.current >= idx && childRefs[idx].current.restoreCard();
    // TODO: when quickly swipe and restore multiple times the same card,
    // it happens multiple outOfFrame events are queued and the card disappear
    // during latest swipes. Only the last outOfFrame event should be considered valid
  };

  return (
    <div className="h-full">
      <link
        href="https://fonts.googleapis.com/css?family=Damion&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css?family=Alatsi&display=swap"
        rel="stylesheet"
      />
      <Card className="cardContainer">
        {data.map((title: any, index: number) => (
          <TinderCard
            ref={childRefs[index]}
            className="swipe"
            key={title.ratingKey}
            onSwipe={(dir) => swiped(dir, index, title.ratingKey)}
            onCardLeftScreen={() => outOfFrame(title.title, index)}
            preventSwipe={['up', 'down']}
          >
            <div
              style={{
                backgroundImage: 'url(/imageproxy/image' + title.thumb + ')',
              }}
              className="card"
            ></div>
          </TinderCard>
        ))}
      </Card>
      {lastDirection ? (
        <h2 key={lastDirection} className="infoText">
          You swiped {lastDirection}
        </h2>
      ) : (
        <h2 className="infoText">Swipe a card to select!</h2>
      )}
    </div>
  );
}

export default SwapableCard;
