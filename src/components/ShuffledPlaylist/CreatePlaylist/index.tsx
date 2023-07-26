import ListView from '@app/components/Common/ListView';
import { useEffect, useState } from 'react';
// import SearchInput from '@app/components/Common/SearchInput';
import Button from '@app/components/Common/Button';
import Card from '@app/components/Common/Card';
import useDiscover from '@app/hooks/useListLoading';
import Error from '@app/pages/_error';
import { Disclosure } from '@headlessui/react';
import { PlusIcon } from '@heroicons/react/24/outline';
import type { ShowResult } from '@server/models/Search';
import axios from 'axios';
import { Field, Formik } from 'formik';
import toast from 'react-hot-toast';
import { defineMessages, useIntl } from 'react-intl';
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
});

interface CreatePlaylistProps {
  onComplete?: () => void;
}

const CreatePlaylist = ({ onComplete }: CreatePlaylistProps) => {
  const intl = useIntl();
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const [playlists, setPlaylists] = useState<{ selections: string[] }>({
    selections: [],
  });

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

  const {
    isLoadingInitialData,
    isEmpty,
    isLoadingMore,
    isReachingEnd,
    titles,
    fetchMore,
    error,
  } = useDiscover<ShowResult>('/api/v1/tv/shows');

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
                  <div className="form-input-area">
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
