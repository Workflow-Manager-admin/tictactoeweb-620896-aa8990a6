import React, { useState, useEffect } from "react";
import "./App.css";

// Set your backend endpoint (update for deployment as needed)
const API_BASE_URL = "http://localhost:3001";

// PUBLIC_INTERFACE
function App() {
  // State variables for board, current player, status, etc.
  const [board, setBoard] = useState(Array(9).fill(""));
  const [isXsTurn, setIsXsTurn] = useState(true);
  const [status, setStatus] = useState("Welcome to Tic Tac Toe!");
  const [gameId, setGameId] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Color theme CSS variables (primary: #1a73e8, accent: #ea4335, secondary: #fbbc05)
  useEffect(() => {
    document.documentElement.style.setProperty("--primary", "#1a73e8");
    document.documentElement.style.setProperty("--accent", "#ea4335");
    document.documentElement.style.setProperty("--secondary", "#fbbc05");
  }, []);

  // PUBLIC_INTERFACE
  /**
   * Start or restart the game. Initializes board and queries backend for new game.
   */
  const startGame = async () => {
    setIsLoading(true);
    try {
      // POST to backend's "start game" endpoint
      const res = await fetch(`${API_BASE_URL}/start`, { method: "POST" });
      const data = await res.json();
      setGameId(data.game_id || data.id || null);
      setBoard(data.board || Array(9).fill(""));
      setIsXsTurn(true);
      setStatus("Game started! X's turn");
      setGameOver(false);
    } catch (err) {
      setStatus("❌ Could not start game. Backend unavailable?");
      setGameId(null);
      setBoard(Array(9).fill(""));
      setGameOver(true);
    }
    setIsLoading(false);
  };

  // Start a new game on load
  useEffect(() => {
    startGame();
    // eslint-disable-next-line
  }, []);

  // PUBLIC_INTERFACE
  /**
   * Handle a player move. Posts move to backend for validation and updates UI.
   * @param {number} idx - index of square clicked (0-8)
   */
  const handleMove = async (idx) => {
    if (board[idx] !== "" || gameOver || !gameId) return;
    setIsLoading(true);
    try {
      // POST move to backend: /move {game_id, position}
      const res = await fetch(`${API_BASE_URL}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game_id: gameId,
          position: idx,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setStatus("❌ Invalid move. Try again.");
        setIsLoading(false);
        return;
      }
      setBoard(data.board);
      setGameOver(!!data.game_over);
      setIsXsTurn(!isXsTurn);

      let statusMsg = "";
      if (data.winner) {
        statusMsg = `🎉 ${data.winner} wins!`;
      } else if (data.game_over && !data.winner) {
        statusMsg = "It's a draw!";
      } else {
        statusMsg = data.next_turn
          ? `${data.next_turn}'s turn`
          : isXsTurn
          ? "O's turn"
          : "X's turn";
      }
      setStatus(statusMsg);
    } catch {
      setStatus("❌ Lost connection to server.");
    }
    setIsLoading(false);
  };

  // PUBLIC_INTERFACE
  /**
   * Renders the tic tac toe cells in a 3x3 grid.
   */
  const renderBoard = () =>
    board.map((cell, i) => (
      <button
        key={i}
        className={`ttt-cell${cell ? " filled" : ""}`}
        style={{
          color:
            cell === "X"
              ? "var(--primary)"
              : cell === "O"
              ? "var(--accent)"
              : "inherit",
          cursor: !cell && !gameOver && !isLoading ? "pointer" : "default",
        }}
        onClick={() => handleMove(i)}
        disabled={!!cell || gameOver || isLoading}
        aria-label={`cell ${i + 1}${cell ? ` filled with ${cell}` : ""}`}
      >
        {cell}
      </button>
    ));

  // PUBLIC_INTERFACE
  /**
   * Handler for restart. Triggers new game.
   */
  const handleRestart = () => {
    startGame();
  };

  return (
    <div className="App">
      <div className="ttt-center">
        <div className="ttt-header">
          <h1 className="ttt-title">
            <span style={{ color: "var(--primary)" }}>Tic</span>
            <span> </span>
            <span style={{ color: "var(--accent)" }}>Tac</span>
            <span> </span>
            <span style={{ color: "var(--secondary)" }}>Toe</span>
          </h1>
          <div className="ttt-controls">
            <button
              className="ttt-btn"
              style={{ background: "var(--primary)" }}
              onClick={handleRestart}
              disabled={isLoading}
              aria-label={"Start or restart game"}
            >
              {isLoading ? "Loading..." : gameOver ? "Restart" : "Restart"}
            </button>
          </div>
        </div>
        <div className="ttt-status" aria-live="polite">
          {status}
        </div>
        <div className="ttt-board">{renderBoard()}</div>
      </div>
      <footer className="ttt-footer">
        <span style={{ fontSize: 13, color: "#999" }}>
          Powered by React & FastAPI
        </span>
      </footer>
    </div>
  );
}

export default App;
