import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "./App.css";

let socket;

function Box(props) {
  function changeColor() {
    socket.emit("update", {
      color: props.selectedColor,
      position: {
        x: props.x,
        y: props.y,
      },
    });
  }

  return (
    <div
      onClick={changeColor}
      style={{
        background: props.color,
        width: "30px",
        height: "30px",
        margin: "1px",
      }}
    ></div>
  );
}

function App() {
  const [grid, setGrid] = useState(null);
  const [color, setColor] = useState("#f3f3f3");

  useEffect(() => {
    socket = io("http://localhost:4000");

    socket.on("connect", () => {
      socket.emit("ready");
    });

    socket.on("initial_state", (data) => {
      setGrid(data);
    });

    socket.on("updated_state", (data) => {
      console.log("updated state");
      setGrid(data);
    });
  }, []);

  if (!grid) return <p>Loading...</p>;

  return (
    <div className="App"  >
      <header className="App-header">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />

        {grid.map((y, yPos) => {
          return (
            <div style={{ display: "flex" }}>
              {y.map((x, xPos) => {
                return (
                  <Box
                    color={x.color}
                    x={xPos}
                    y={yPos}
                    selectedColor={color}
                  />
                );
              })}
            </div>
          );
        })}
      </header>
    </div>
  );
}

export default App;
