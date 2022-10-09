const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const PORT = process.env.PORT || 3000;

const GUESSED_WORD_EVENT = "guessedWord";
const GUESS_EVENT = "guess";
const CONNECTION_EVENT = "connection";

app.use(express.static("public"));

const wordsToGuess = [
  "javascript",
  "python",
  "go",
  "ruby",
  "rust",
  "java",
  "c#",
  "scala",
  "closure",
  "smalltalk",
  "pawn",
  "lisp",
  "php",
  "matlab",
  "c++",
  "cobol",
  "haskell",
  "typescript",
  "assembly",
  "kotlin",
  "dart",
];

let wordToGuess;
let guessedWord;

const setNextWord = () => {
  const word = wordsToGuess[parseInt(Math.random() * wordsToGuess.length)];
  wordToGuess = word;
  guessedWord = word.split("").fill("_");
};
setNextWord();

const getGuessedWord = () => {
  return guessedWord.join("");
};

const emitGuessedWord = (channel) => {
  channel.emit(GUESSED_WORD_EVENT, getGuessedWord());
};

io.on(CONNECTION_EVENT, (socket) => {
  console.log("a user connected");

  emitGuessedWord(socket);

  socket.on(GUESS_EVENT, (letter) => {
    let isCorrectGuess = false;
    [...wordToGuess].forEach((char, i) => {
      if (char === letter) {
        guessedWord[i] = char;
        isCorrectGuess = true;
      }
    });
    if (isCorrectGuess) {
      if (!guessedWord.includes("_")) {
        setNextWord();
      }
      emitGuessedWord(io);
    }
  });
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
