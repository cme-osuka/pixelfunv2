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

let state = initialState();

// Socket listeners
io.on("connection", (socket) => {
  // Event: "ready"
  socket.on("ready", () => {
    socket.emit("initial_state", state)
  })

  // Event: "update"
  socket.on("update", (data) => {
    const color = data.color;
    const { x, y } = data.position;
    const user = socket.id;

    state[y][x] = {
      id: state[y][x].id, // Nuvarande id't på rutan
      color: color,
      lastChangedBy: user
    }

    io.emit("updated_state", state);
  })
})

io.listen(4000);
