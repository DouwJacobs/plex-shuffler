import Button from '@app/components/Common/Button';
import Modal from '@app/components/Common/Modal';
import { Transition } from '@headlessui/react';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import type { SocketUser } from '@server/socketio/utils';
import { Fragment, useState } from 'react';

const MatchUsers = ({ sessionUsers }: { sessionUsers: SocketUser[] }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <div className="relative">
      <Button onClick={() => setModalOpen(true)}>
        <UserGroupIcon />
        <span className="ml-1">Users ({sessionUsers.length})</span>
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
          title={'Users in Session'}
          okText={'Close'}
          onOk={() => setModalOpen(false)}
        >
          {sessionUsers.map((user: SocketUser) => {
            return (
              <div
                key={user.id}
                className="truncate text-xl font-semibold text-gray-200"
              >
                {user?.name}
              </div>
            );
          })}
        </Modal>
      </Transition>
    </div>

    // <Menu as="div" className="mt-5 relative ml-3 md:mt-0">
    //   <div>
    //     <Menu.Button
    //       className="flex max-w-xs items-center text-sm focus:outline-none"
    //       data-testid="matchflix-user-menu"
    //     >
    //       <p>Users ({sessionUsers.length}) ▼</p>
    //     </Menu.Button>
    //   </div>
    //   <Transition
    //     as={Fragment}
    //     enter="transition ease-out duration-100"
    //     enterFrom="opacity-0 scale-95"
    //     enterTo="opacity-100 scale-100"
    //     leave="transition ease-in duration-75"
    //     leaveFrom="opacity-100 scale-100"
    //     leaveTo="opacity-0 scale-95"
    //     appear
    //   >
    //     <Menu.Items className="absolute right-0 mt-2 w-72 origin-top-right rounded-md shadow-lg">
    //       <div className="plex-bg-primary divide-y divide-gray-700 rounded-md bg-gray-800 ring-1 ring-gray-700 backdrop-blur z-50">
    //         <div className="flex flex-col space-y-4 px-4 py-4">
    //           <div className="flex items-center space-x-2">
    //             <div className="flex min-w-0 flex-col">
    //                 {sessionUsers.map((user : SocketUser) => {
    //                     return <span key={user.id} className="truncate text-xl font-semibold text-gray-200">
    //                     {user?.name}
    //                   </span>
    //                 })}
    //             </div>
    //           </div>
    //         </div>
    //       </div>
    //     </Menu.Items>
    //   </Transition>
    // </Menu>
  );
};

export default MatchUsers;
