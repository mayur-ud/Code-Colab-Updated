import express from "express";
const app = express();
import { createServer } from "http";
import { Server } from "socket.io";

const ACTIONS = {
    JOIN: 'join',
    JOINED: 'joined',
    DISCONNECTED: 'disconnected',
    CODE_CHANGE: 'code-change',
    SYNC_CODE: 'sync-code',
    LEAVE: 'leave',
    BROADCAST : 'broadcast',
    GET_BROADCAST : 'getBroadcast',
    STREAM : 'stream'
};
const server = createServer(app);
const io = new Server(server);


const userSocketMap = {};
function getAllConnectedClients(projectId) {
  // Map
  return Array.from(io.sockets.adapter.rooms.get(projectId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId],
      };
    }
  );
}

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  socket.on(ACTIONS.JOIN, ({ projectId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(projectId);
    console.log(projectId, username);
    const clients = getAllConnectedClients(projectId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  socket.on(ACTIONS.CODE_CHANGE, ({ projectId, code }) => {
    socket.in(projectId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.BROADCAST, ({ projectId, cast }) => {
    console.log(projectId, cast, "SERVER BCAST");
    socket.in(projectId).emit(ACTIONS.GET_BROADCAST, { cast });
  });

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
    socket.leave();
  });

  socket;
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`WS Listening on port ${PORT}`));