import { CheckIcon } from '@heroicons/react/24/solid';

interface CurrentStep {
  stepNumber: number;
  description: string;
  active?: boolean;
  completed?: boolean;
  isLastStep?: boolean;
}

const SetupSteps = ({
  stepNumber,
  description,
  active = false,
  completed = false,
  isLastStep = false,
}: CurrentStep) => {
  return (
    <li className="relative md:flex md:flex-1">
      <div className="flex items-center space-x-4 px-6 py-4 text-sm font-medium leading-5">
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center border-2 
          ${active ? 'plex-border-primary ' : 'border-white '}
          ${
            completed ? 'plex-border-white plex-bg-primary ' : ''
          } rounded-full`}
        >
          {completed && <CheckIcon className="h-6 w-6 text-white" />}
          {!completed && (
            <p className={active ? 'text-white' : 'text-white'}>{stepNumber}</p>
          )}
        </div>
        <p
          className={`plex-border-primary text-sm font-medium leading-5 ${
            active ? 'text-white' : 'text-white'
          }`}
        >
          {description}
        </p>
      </div>

      {!isLastStep && (
        <div className="absolute right-0 top-0 hidden h-full w-5 md:block">
          <svg
            className="plex-color-primary h-full w-full"
            viewBox="0 0 22 80"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M0 -2L20 40L0 82"
              vectorEffect="non-scaling-stroke"
              stroke="currentcolor"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </li>
  );
};

export default SetupSteps;
