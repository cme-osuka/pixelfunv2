const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");

const io = new Server({
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Spel-logik
// Skapa själva boxens state
const initialBox = () => {
  return {
    id: uuidv4(),
    color: "#f3f3f3",
    lastChangedBy: "server",
  };
};

const initialState = () =>
  new Array(20).fill("").map(() => {
    return new Array(20).fill("").map(initialBox);
  });

const rooms = {
  default: {
    name: "Default room",
    state: initialState(),
  },
};

// Socket listeners
io.on("connection", (socket) => {
  // Event: "ready"
  socket.on("ready", () => {
    // Sätt användarens rum till default
    socket.join("default");

    socket.emit("initial_state", rooms["default"].state);
  });

  // room = "potatislandet"
  socket.on("create_room", (room) => {
    rooms[room] = {
      name: room,
      state: initialState()
    }

    console.log(rooms);
  })

  socket.on("join_room", (room) => {
    //["socket.id", "default"]
    const joinedRooms = Array.from(socket.rooms);
    const roomToLeave = joinedRooms[1]; // "default"
    socket.leave(roomToLeave)

    // Gå med i nya rummet 
    socket.join(room);
    io.to(room).emit("updated_state", rooms[room].state);
    console.log(`${socket.id} joined room: ${room}`);
  });

  // Event: "update"
  socket.on("update", (data) => {
    const joinedRooms = Array.from(socket.rooms);
    const currentRoom = joinedRooms[1]; // FEA21
    const currentState = rooms[currentRoom].state;

    const color = data.color;
    const { x, y } = data.position;
    const user = socket.id;

    currentState[y][x] = {
      id: currentState[y][x].id, // Nuvarande id't på rutan
      color: color,
      lastChangedBy: user,
    };

    io.to(currentRoom).emit("updated_state", currentState);
  });
});

io.listen(4000);
console.log("Servern kör på port 4000");