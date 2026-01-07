import Button from '@app/components/Common/Button';
import Card from '@app/components/Common/Card';
import ListView from '@app/components/Common/ListView';
import useDiscover from '@app/hooks/useListLoading';
import Error from '@app/pages/_error';
import { Disclosure } from '@headlessui/react';
import { PlusIcon } from '@heroicons/react/24/outline';
import type { PlexLibrary } from '@server/interfaces/api/plexInterfaces';
import type { ShowResult } from '@server/models/Search';
import axios from 'axios';
import { Field, Formik } from 'formik';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { defineMessages, useIntl } from 'react-intl';
import useSWR from 'swr';
import * as Yup from 'yup';

const messages = defineMessages({
  playlistTitle: 'Playlist Name',
  playlistNameRequired: 'Please enter valid playlist name!',
  playlistSuccess: 'Shuffled playlist created successfully!',
  playlistFailed: 'Error occured while creating shuffled playlist.',
  playlistCreating: 'Creating shuffled playlist...',
  playlistCreate: 'Create Playlist',
  playlistCoverUrl: 'Playlist Cover URL',
  playlistValidUrl: 'Playlist Cover URL should be a valid url',
  playlistDescription: 'Playlist Description',
  unwatchedOnly: 'Include Unwatched Only',
  selectLibraries: 'Select Libraries',
  allLibraries: 'All Libraries',
  selectAll: 'Select All',
  deselectAll: 'Deselect All',
  librariesSelected: 'Libraries Selected',
  librarySelected: 'Library Selected',
});

interface CreatePlaylistProps {
  onComplete?: () => void;
}

const CreatePlaylist = ({ onComplete }: CreatePlaylistProps) => {
  const intl = useIntl();
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [librarySelectorOpen, setLibrarySelectorOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedLibraryIds, setSelectedLibraryIds] = useState<string[]>([]);

  const [playlists, setPlaylists] = useState<{ selections: string[] }>({
    selections: [],
  });

  // Fetch available libraries
  const { data: plexTVLibraries } = useSWR<PlexLibrary[]>(
    '/api/v1/tv/libraries'
  );

  useEffect(() => {
    const updateScrolled = () => {
      if (window.pageYOffset > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', updateScrolled, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateScrolled);
    };
  }, []);

  // Close library selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        librarySelectorOpen &&
        !target.closest('.library-selector-container')
      ) {
        setLibrarySelectorOpen(false);
      }
    };

    if (librarySelectorOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [librarySelectorOpen]);

  function handleCheckboxChange(key: string) {
    const sel = playlists.selections;
    const find = sel.indexOf(key);
    if (find > -1) {
      sel.splice(find, 1);
    } else {
      sel.push(key);
    }

    setPlaylists({
      selections: sel,
    });
  }

  function handleLibraryToggle(libraryId: string) {
    setSelectedLibraryIds((prev) => {
      if (prev.includes(libraryId)) {
        return prev.filter((id) => id !== libraryId);
      } else {
        return [...prev, libraryId];
      }
    });
  }

  function handleSelectAllLibraries() {
    if (plexTVLibraries) {
      if (selectedLibraryIds.length === plexTVLibraries.length) {
        // Deselect all
        setSelectedLibraryIds([]);
      } else {
        // Select all
        setSelectedLibraryIds(plexTVLibraries.map((lib) => String(lib.id)));
      }
    }
  }

  // Build options for useDiscover, including libraryIds if selected
  // Use useMemo to ensure the options object reference changes when selectedLibraryIds changes
  // Always include libraryIds parameter (even if empty) so SWR detects changes properly
  const discoverOptions = useMemo(
    () => ({
      libraryIds:
        selectedLibraryIds.length > 0 ? selectedLibraryIds.join(',') : 'all',
    }),
    [selectedLibraryIds]
  );

  const {
    isLoadingInitialData,
    isEmpty,
    isLoadingMore,
    isReachingEnd,
    titles,
    fetchMore,
    error,
  } = useDiscover<ShowResult>('/api/v1/tv/shows', discoverOptions);

  if (error) {
    return <Error statusCode={500} />;
  }

  const CreatePlaylistSchema = Yup.object().shape({
    playlistTitle: Yup.string()
      .nullable()
      .required(intl.formatMessage(messages.playlistNameRequired)),
    playlistCoverUrl: Yup.string()
      .url(intl.formatMessage(messages.playlistValidUrl))
      .nullable(),
    playlistDescription: Yup.string().nullable(),
  });

  return (
    <Formik
      initialValues={{
        playlistTitle: '',
        playlistCoverUrl: '',
        playlistDescription: '',
        unwatchedOnly: false,
      }}
      enableReinitialize={true}
      validationSchema={CreatePlaylistSchema}
      onSubmit={async (values) => {
        let toastId: string | null = null;
        try {
          toastId = toast.loading(
            intl.formatMessage(messages.playlistCreating)
          );
          await axios.post('/api/v1/user/shuffled-playlist', {
            playlistTitle: values.playlistTitle,
            playlists: playlists.selections,
            playlistDescription: values.playlistDescription,
            playlistCoverUrl: values.playlistCoverUrl,
            unwatchedOnly: values.unwatchedOnly,
          });

          if (toastId) {
            toast.dismiss(toastId);
          }

          toast.success(intl.formatMessage(messages.playlistSuccess));
          if (onComplete) {
            onComplete();
          }
        } catch (e) {
          if (toastId) {
            toast.dismiss(toastId);
          }
          if (e.response.data.message) {
            toast.error(e.response.data.message);
          } else {
            toast.error(intl.formatMessage(messages.playlistFailed));
          }
        }
      }}
    >
      {({ errors, touched, values, handleSubmit, isSubmitting }) => {
        return (
          <form className="section" onSubmit={handleSubmit}>
            <div
              className={`sticky top-16 z-10 ${
                isScrolled && 'plex-bg-secondary'
              }`}
            >
              <Card className={`p-2`}>
                <div className="shuffled-playlist-form-row">
                  <div className="form-input-area flex-1">
                    <Field
                      type="text"
                      id="playlistTitle"
                      name="playlistTitle"
                      className="block h-9"
                      placeholder={intl.formatMessage(messages.playlistTitle)}
                      value={values.playlistTitle}
                    />
                    {errors.playlistTitle &&
                      touched.playlistTitle &&
                      typeof errors.playlistTitle === 'string' && (
                        <div className="error">{errors.playlistTitle}</div>
                      )}
                  </div>

                  <div className="flex">
                    <span className="mt-2 inline-flex h-9 rounded-md shadow-sm md:ml-3 md:mt-0">
                      <Button
                        id="savePlaylist"
                        buttonType="primary"
                        type="submit"
                        disabled={isSubmitting}
                      >
                        <PlusIcon />
                        <span>
                          {intl.formatMessage(messages.playlistCreate)}
                        </span>
                      </Button>
                    </span>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-input-area">
                    <div className="form-input-field library-selector-container w-1/4">
                      <button
                        type="button"
                        id="librarySelector"
                        onClick={() =>
                          setLibrarySelectorOpen(!librarySelectorOpen)
                        }
                        className="block h-9 w-full min-w-0 flex-1 rounded-md border border-gray-500 bg-zinc-700 px-3 py-2 text-left text-white transition duration-150 ease-in-out focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm sm:leading-5"
                        disabled={!plexTVLibraries}
                      >
                        {selectedLibraryIds.length === 0
                          ? intl.formatMessage(messages.allLibraries)
                          : selectedLibraryIds.length ===
                            plexTVLibraries?.length
                          ? intl.formatMessage(messages.allLibraries)
                          : `${selectedLibraryIds.length} ${
                              selectedLibraryIds.length === 1
                                ? intl.formatMessage(messages.librarySelected)
                                : intl.formatMessage(messages.librariesSelected)
                            }`}
                      </button>
                      {librarySelectorOpen && plexTVLibraries && (
                        <div className="absolute z-20 mt-1 w-full max-w-xl rounded-md border border-gray-500 bg-zinc-700 shadow-lg">
                          <div className="max-h-60 overflow-auto py-1">
                            <button
                              type="button"
                              className="w-full cursor-pointer px-3 py-2 text-left text-sm text-white transition duration-150 ease-in-out hover:bg-gray-600 focus:bg-gray-600 focus:outline-none sm:text-sm sm:leading-5"
                              onClick={handleSelectAllLibraries}
                            >
                              {selectedLibraryIds.length ===
                              plexTVLibraries.length
                                ? intl.formatMessage(messages.deselectAll)
                                : intl.formatMessage(messages.selectAll)}
                            </button>
                            <div className="border-t border-gray-500"></div>
                            {plexTVLibraries.map((library: PlexLibrary) => (
                              <div
                                key={library.id}
                                className="flex items-center px-3 py-2 text-white transition duration-150 ease-in-out hover:bg-gray-600 sm:text-sm sm:leading-5"
                              >
                                <input
                                  type="checkbox"
                                  id={`library-${library.id}`}
                                  checked={selectedLibraryIds.includes(
                                    String(library.id)
                                  )}
                                  onChange={() =>
                                    handleLibraryToggle(String(library.id))
                                  }
                                  className="h-6 w-6 rounded-md text-indigo-600 transition duration-150 ease-in-out"
                                />
                                <label
                                  htmlFor={`library-${library.id}`}
                                  className="ml-3 cursor-pointer text-sm text-white"
                                >
                                  {library.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <Disclosure>
                  <Disclosure.Button
                    onClick={() => setOptionsOpen(!optionsOpen)}
                    className="mt-2 inline-flex cursor-pointer items-center justify-center whitespace-nowrap font-medium leading-5 transition duration-150 ease-in-out focus:outline-none disabled:opacity-50"
                  >
                    {optionsOpen ? '-' : '+'} Options
                  </Disclosure.Button>
                  <Disclosure.Panel>
                    <div className="form-row">
                      <label htmlFor="hostname" className="text-label">
                        {intl.formatMessage(messages.playlistCoverUrl)}
                      </label>
                      <div className="form-input-area">
                        <div className="form-input-field h-9">
                          <Field
                            type="text"
                            id="playlistCoverUrl"
                            name="playlistCoverUrl"
                            value={values.playlistCoverUrl}
                            className="rounded"
                          />
                        </div>
                        {errors.playlistCoverUrl &&
                          typeof errors.playlistCoverUrl === 'string' && (
                            <div className="error">
                              {errors.playlistCoverUrl}
                            </div>
                          )}
                      </div>
                    </div>
                    <div className="form-row">
                      <label htmlFor="hostname" className="text-label">
                        {intl.formatMessage(messages.playlistDescription)}
                      </label>
                      <div className="form-input-area">
                        <div className="form-input-field h-9">
                          <Field
                            component="textarea"
                            id="playlistDescription"
                            name="playlistDescription"
                            value={values.playlistDescription}
                            className="rounded"
                            rows="3"
                          />
                        </div>
                        {errors.playlistDescription &&
                          typeof errors.playlistDescription === 'string' && (
                            <div className="error">
                              {errors.playlistDescription}
                            </div>
                          )}
                      </div>
                    </div>
                    <div className="form-row">
                      <label htmlFor="unwatchedOnly" className="checkbox-label">
                        {intl.formatMessage(messages.unwatchedOnly)}
                      </label>
                      <div className="form-input-area">
                        <Field
                          type="checkbox"
                          id="unwatchedOnly"
                          name="unwatchedOnly"
                        />
                      </div>
                    </div>
                  </Disclosure.Panel>
                </Disclosure>
              </Card>
            </div>

            <ListView
              items={titles}
              isEmpty={isEmpty}
              isLoading={
                isLoadingInitialData ||
                (isLoadingMore && (titles?.length ?? 0) > 0)
              }
              isReachingEnd={isReachingEnd}
              onScrollBottom={fetchMore}
              handleOnChange={handleCheckboxChange}
              selected={playlists.selections}
            />
          </form>
        );
      }}
    </Formik>
  );
};

export default CreatePlaylist;
