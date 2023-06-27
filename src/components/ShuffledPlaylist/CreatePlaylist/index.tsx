import ListView from '@app/components/Common/ListView';
import { useState } from 'react';
// import SearchInput from '@app/components/Common/SearchInput';
import Button from '@app/components/Common/Button';
import Card from '@app/components/Common/Card';
import useDiscover from '@app/hooks/useListLoading';
import Error from '@app/pages/_error';
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
});

interface CreatePlaylistProps {
  onComplete?: () => void;
}

const CreatePlaylist = ({ onComplete }: CreatePlaylistProps) => {
  const intl = useIntl();

  const [playlists, setPlaylists] = useState<{ selections: string[] }>({
    selections: [],
  });

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
  });

  return (
    <Formik
      initialValues={{
        playlistTitle: '',
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
          toast.error(intl.formatMessage(messages.playlistFailed));
        }
      }}
    >
      {({ errors, touched, values, handleSubmit, isSubmitting }) => {
        return (
          <form className="section" onSubmit={handleSubmit}>
            <div className="sticky top-16 z-10">
              <Card className="p-2">
                <div className="shuffled-playlist-form-row">
                  <div className="form-input-area">
                    <Field
                      type="text"
                      inputMode="numeric"
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
