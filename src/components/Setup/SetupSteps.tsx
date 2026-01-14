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
      <div className="flex items-center space-x-4 px-6 py-5 text-base font-medium leading-6">
        <div
          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center border-2 transition-all duration-200
          ${
            active
              ? 'plex-border-primary border-plex-primary shadow-lg shadow-plex-primary/30 '
              : 'border-gray-500/50 '
          }
          ${
            completed
              ? 'plex-border-primary plex-bg-primary border-plex-primary shadow-lg shadow-plex-primary/30 '
              : ''
          } rounded-full`}
        >
          {completed && <CheckIcon className="h-7 w-7 text-white" />}
          {!completed && (
            <p
              className={`text-base font-semibold ${
                active ? 'text-white' : 'text-gray-400'
              }`}
            >
              {stepNumber}
            </p>
          )}
        </div>
        <p
          className={`text-base font-medium leading-6 transition-colors duration-200 ${
            active ? 'text-white' : 'text-gray-400'
          }`}
        >
          {description}
        </p>
      </div>

      {!isLastStep && (
        <div className="absolute right-0 top-0 hidden h-full w-5 md:block">
          <svg
            className="h-full w-full text-gray-600/50"
            viewBox="0 0 22 80"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M0 -2L20 40L0 82"
              vectorEffect="non-scaling-stroke"
              stroke="currentcolor"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </div>
      )}
    </li>
  );
};

export default SetupSteps;
