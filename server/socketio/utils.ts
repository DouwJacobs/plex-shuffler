import _ from 'lodash';

export interface SocketUser {
  id: string;
  name: string;
  room: string;
  choices?: string[];
  first?: boolean;
}

const users: SocketUser[] = [];

export const addUser = ({ id, name, room }: SocketUser) => {
  const roomUsers = getUsersInRoom(room);

  const existingUser = roomUsers.findIndex((user) => {
    return user.name === name.trim();
  });

  if (existingUser > -1) {
    users[existingUser].id = id;
    return { user: users[existingUser] };
  }

  const choices: string[] = [];
  const user = {
    id,
    name: name.trim(),
    room: room.trim(),
    choices,
    first: !(roomUsers.length > 0),
  };

  users.push(user);
  return { user };
};

export const removeUser = (id: string) => {
  const index = users.findIndex((user) => {
    return user.id === id;
  });

  if (index !== -1) {
    users.splice(index, 1);
  }
};

export const getUser = (id: string) => users.find((user) => user.id === id);

export const getUsersInRoom = (room: string) =>
  users.filter((user) => user.room === room);

export const addChoice = (id: string, room: string, ratingKey: string) => {
  const roomUsers = getUsersInRoom(room);
  const user = roomUsers.find((user) => user.id === id);

  if (user) {
    if (!user.choices?.includes(ratingKey)) {
      user.choices?.push(ratingKey);
    }
  }

  return user;
};

export const checkUserChoice = (room: string) => {
  const roomUsers = getUsersInRoom(room);

  const choices: any[] = [];

  roomUsers.map((user: SocketUser) => {
    choices.push(user.choices);
  });

  const matches = _.intersection(...choices);

  return matches;
};
