import logger from '@server/logger';
import type http from 'http';
import * as socketio from 'socket.io';
import {
  addChoice,
  addUser,
  checkUserChoice,
  getUser,
  getUsersInRoom,
  removeUser,
} from './utils';

const socketIO = (server: http.Server) => {
  const io: socketio.Server = new socketio.Server(server);

  io.on('connection', (socket: socketio.Socket) => {
    logger.info('Socket connection established', {
      label: 'Socket.IO',
      socketId: socket.id,
      ip: socket.handshake.address,
    });

    socket.on(
      'user_entered_session',
      ({ name, room }: { name: string; room: string }) => {
        logger.debug('User entering session', {
          label: 'Socket.IO',
          socketId: socket.id,
          name,
          room,
        });
        const { user } = addUser({ id: socket.id, name, room });

        if (user) {
          socket.join(user.room);
          logger.info('User joined session room', {
            label: 'Socket.IO',
            socketId: socket.id,
            name,
            room: user.room,
          });
          io.to(user.room).emit('session_users', getUsersInRoom(user.room));
          io.to(user.room).emit('setMatches', checkUserChoice(user.room));
        }
      }
    );

    socket.on('addUserChoice', (room: string, ratingKey: string) => {
      logger.debug('User choice added', {
        label: 'Socket.IO',
        socketId: socket.id,
        room,
        ratingKey,
      });
      const user = addChoice(socket.id, room, ratingKey);
      if (user) {
        logger.info('User choice processed, broadcasting matches', {
          label: 'Socket.IO',
          socketId: socket.id,
          room: user.room,
        });
        io.to(user.room).emit('setMatches', checkUserChoice(user.room));
      }
    });

    socket.on(
      'changeType',
      ({ room, type }: { room: string; type: string }): void => {
        logger.debug('Type changed in session', {
          label: 'Socket.IO',
          socketId: socket.id,
          room,
          type,
        });
        io.to(room).emit('setType', type);
      }
    );

    socket.on(
      'changeGenre',
      ({ room, genre }: { room: string; genre: string }): void => {
        logger.debug('Genre changed in session', {
          label: 'Socket.IO',
          socketId: socket.id,
          room,
          genre,
        });
        io.to(room).emit('setGenre', genre);
      }
    );

    socket.on(
      'changeSortBy',
      ({ room, sortBy }: { room: string; sortBy: string }): void => {
        logger.debug('Sort by changed in session', {
          label: 'Socket.IO',
          socketId: socket.id,
          room,
          sortBy,
        });
        io.to(room).emit('setsortBy', sortBy);
      }
    );

    socket.on('disconnect', () => {
      logger.debug('Socket disconnecting', {
        label: 'Socket.IO',
        socketId: socket.id,
      });
      const user = getUser(socket.id);
      removeUser(socket.id);
      if (user) {
        logger.info('User left session room', {
          label: 'Socket.IO',
          socketId: socket.id,
          name: user.name,
          room: user.room,
        });
        io.to(user.room).emit('session_users', getUsersInRoom(user.room));
      } else {
        logger.debug('Socket disconnected (no user found)', {
          label: 'Socket.IO',
          socketId: socket.id,
        });
      }
    });
  });
};

export default socketIO;
