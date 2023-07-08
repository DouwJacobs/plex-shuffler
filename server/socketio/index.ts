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
    socket.on(
      'user_entered_session',
      ({ name, room }: { name: string; room: string }) => {
        const { user } = addUser({ id: socket.id, name, room });

        if (user) {
          socket.join(user.room);
          io.to(user.room).emit('session_users', getUsersInRoom(user.room));
          io.to(user.room).emit('setMatches', checkUserChoice(user.room));
        }
      }
    );

    socket.on('addUserChoice', (room: string, ratingKey: string) => {
      const user = addChoice(socket.id, room, ratingKey);
      if (user) {
        io.to(user.room).emit('setMatches', checkUserChoice(user.room));
      }
    });

    socket.on(
      'changeType',
      ({ room, type }: { room: string; type: string }): void => {
        io.to(room).emit('setType', type);
      }
    );

    socket.on('disconnect', () => {
      const user = getUser(socket.id);
      removeUser(socket.id);
      if (user) {
        io.to(user.room).emit('session_users', getUsersInRoom(user.room));
      }
    });
  });
};

export default socketIO;
