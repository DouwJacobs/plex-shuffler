import { useEffect, useRef } from 'react';
import useSWRInfinite from 'swr/infinite';

export interface BaseSearchResult<T> {
  page: number;
  totalResults: number;
  totalPages: number;
  results: T[];
}

interface BaseMedia {
  mediaType: string;
}

interface LoadingResult<T, S> {
  isLoadingInitialData: boolean;
  isLoadingMore: boolean;
  fetchMore: () => void;
  isEmpty: boolean;
  isReachingEnd: boolean;
  error: unknown;
  titles: T[];
  firstResultData?: BaseSearchResult<T> & S;
}

const extraEncodes: [RegExp, string][] = [
  [/\(/g, '%28'],
  [/\)/g, '%29'],
  [/!/g, '%21'],
  [/\*/g, '%2A'],
];

export const encodeURIExtraParams = (string: string): string => {
  let finalString = encodeURIComponent(string);
  extraEncodes.forEach((encode) => {
    finalString = finalString.replace(encode[0], encode[1]);
  });
  return finalString;
};

const useListLoading = <
  T extends BaseMedia,
  S = Record<string, never>,
  O = Record<string, unknown>
>(
  endpoint: string,
  options?: O
): LoadingResult<T, S> => {
  // Create a stable string representation of options for tracking changes
  const optionsKey = JSON.stringify(options || {});

  // Track previous options to detect changes
  const prevOptionsKeyRef = useRef(optionsKey);
  const isOptionsChanged = prevOptionsKeyRef.current !== optionsKey;

  // Use an array key so SWR detects option changes (optionsKey included)
  // while ensuring we do NOT send optionsKey to the backend (we only send
  // the real query string). The fetcher below will construct the actual
  // request URL using the first two array elements.
  const swrFetcher = async (key: unknown) => {
    // key will be the array returned by the key function
    const [endpointUrl, finalQueryString] = (key as string[]) || [];
    const url = finalQueryString
      ? `${endpointUrl}?${finalQueryString}`
      : endpointUrl;
    const resp = await fetch(url, { credentials: 'same-origin' });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(text || `Request failed with status ${resp.status}`);
    }
    return (await resp.json()) as BaseSearchResult<T> & S;
  };

  const { data, error, size, setSize, isValidating, mutate } = useSWRInfinite<
    BaseSearchResult<T> & S
  >(
    (pageIndex: number, previousPageData) => {
      if (previousPageData && pageIndex + 1 > previousPageData.totalPages) {
        return null;
      }
      const params: Record<string, unknown> = {
        page: pageIndex + 1,
        ...options,
      };
      const finalQueryString = Object.keys(params)
        .map(
          (paramKey) =>
            `${paramKey}=${encodeURIExtraParams(
              String(params[paramKey] ?? '')
            )}`
        )
        .join('&');

      // (no-op) — keep this function side-effect free for predictable behavior

      // Return an array key: [endpoint, finalQueryString, optionsKey]
      // SWR will use the whole array as the cache key; the fetcher above
      // uses only the first two elements to build the HTTP request so the
      // backend does not receive the hidden optionsKey used for cache invalidation.
      return [endpoint, finalQueryString, optionsKey];
    },
    swrFetcher,
    {
      initialSize: 3,
      revalidateOnMount: true,
    }
  );

  // Reset to page 1 and clear cache when options change
  useEffect(() => {
    if (isOptionsChanged) {
      prevOptionsKeyRef.current = optionsKey;
      // Reset to first page, clear cached data immediately, then load initial pages.
      // Use mutate([], false) to clear the data without triggering revalidation
      // for the old key; then setSize to load fresh pages for the new options.
      setSize(1);
      mutate([], false);
      // Load initial pages for the new options
      setTimeout(() => setSize(3), 0);
      return;
    }
  }, [optionsKey, setSize, mutate, isOptionsChanged]);

  const isLoadingInitialData = !data && !error;
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 &&
      !!data &&
      typeof data[size - 1] === 'undefined' &&
      isValidating);

  const fetchMore = () => {
    setSize(size + 1);
  };

  const titles = (data ?? []).reduce((a, v) => [...a, ...v.results], [] as T[]);
  const isEmpty = !isLoadingInitialData && titles?.length === 0;
  const isReachingEnd =
    isEmpty ||
    (!!data && (data[data?.length - 1]?.results.length ?? 0) < 20) ||
    (!!data && (data[data?.length - 1]?.totalResults ?? 0) < 41);

  return {
    isLoadingInitialData,
    isLoadingMore,
    fetchMore,
    isEmpty,
    isReachingEnd,
    error,
    titles,
    firstResultData: data?.[0],
  };
};

export default useListLoading;
