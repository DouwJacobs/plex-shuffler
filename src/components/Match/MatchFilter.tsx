import Button from '@app/components/Common/Button';
import Modal from '@app/components/Common/Modal';
import { Transition } from '@headlessui/react';
import { FunnelIcon } from '@heroicons/react/24/outline';
import { Fragment, useState } from 'react';

const MatchFilter = ({
  type,
  setType,
}: {
  type: string;
  setType: (val: string) => void;
}) => {
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <div className="relative">
      <Button onClick={() => setModalOpen(true)}>
        <FunnelIcon />
        <span>Filter</span>
      </Button>
      <Transition
        as={Fragment}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        show={isModalOpen}
      >
        <Modal
          title={'Filters'}
          okText={'Close'}
          onOk={() => setModalOpen(false)}
        >
          <div className="flex">
            <span className="plex-bg-transparent inline-flex h-11 cursor-default items-center rounded-l-md border border-r-0 border-gray-500 px-3 text-sm">
              <FunnelIcon className="h-6 w-6" />
            </span>
            <select
              id="filter"
              name="filter"
              onChange={(e) => {
                setType(e.target.value as string);
              }}
              value={type}
              className="rounded-r-only h-11"
            >
              <option value="movies">{'Movies'}</option>
              <option value="tv">{'TV Shows'}</option>
            </select>
          </div>
        </Modal>
      </Transition>
    </div>
  );
};

export default MatchFilter;
