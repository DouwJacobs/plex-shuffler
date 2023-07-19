import useSearchInput from '@app/hooks/useSearchInput';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';

const SearchInput = ({
  searchPlaceholder,
  endPoint,
}: {
  searchPlaceholder: string;
  endPoint: string;
}) => {
  const { searchValue, setSearchValue, setIsOpen, clear } =
    useSearchInput(endPoint);
  return (
    <div className="mb-5 flex flex-1">
      <div className="flex w-full">
        <label htmlFor="search_field" className="sr-only">
          Search
        </label>
        <div className="relative flex w-full items-center text-white ">
          <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
            <MagnifyingGlassIcon className="h-5 w-5" />
          </div>
          <input
            id="search_field"
            style={{ paddingRight: searchValue.length > 0 ? '1.75rem' : '' }}
            className="plex-bg-transparent plex-search-bar block w-full rounded border border-txt-secondary bg-opacity-80 py-2 pl-10 text-white placeholder-txt-secondary sm:text-base"
            placeholder={searchPlaceholder}
            type="search"
            autoComplete="off"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onBlur={() => {
              if (searchValue === '') {
                setIsOpen(false);
              }
            }}
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                (e.target as HTMLInputElement).blur();
              }
            }}
          />
          {searchValue.length > 0 && (
            <button
              className="absolute inset-y-0 right-2 m-auto h-7 w-7 border-none p-1 text-txt-secondary outline-none transition hover:text-white"
              onClick={() => clear()}
            >
              <XCircleIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchInput;
