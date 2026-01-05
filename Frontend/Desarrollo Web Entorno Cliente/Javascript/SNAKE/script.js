//HTML ELEMENTS
const board = document.getElementById('board');
const scoreBoard = document.getElementById('scoreBoard');
const startButton = document.getElementById('start');
const gameOverSign = document.getElementById('gameOver');

//GAME SETTINGS
const boardSize = 10;
const gameSpeed = 100;
const squareTypes = {
        emptySquare: 0,
        snakeSquare:1,
        foodSnake: 2
};

const directions = {
  ArrowUp: -10,
  ArrowDown: 10,
  ArrowRight: 1,
  ArrowLeft: -1,
};


//GAME VARIABLES
let snake;
let score;
let direction;
let boardSquares;
let emptySquares;
let moveInterval;

const drawSnake = () => {
    snake.forEach (square => drawSquare (square, 'snakeSquare'));
}


// Rellena cada cuadrado del tablero
// @params
// square: posición del cuadrado,
// type: tipo de cuadrado (emptySquare, snakeSquare, foodSquare)
const drawSquare = (square, type) => {
  const [row, column] = square.split('');
  boardSquares[row][column] = squareTypes[type];

  const squareElement = document.getElementById(square);
  if (!squareElement) {
    console.error('No se encontró el elemento con id:', square);
    return; // Evita que rompa el código
  }

  squareElement.setAttribute('class', `square ${type}`);

  if (type === 'emptySquare') {
    emptySquares.push(square);
  } else {
    const index = emptySquares.indexOf(square);
    if (index !== -1) emptySquares.splice(index, 1);
  }
};


const moveSnake = () => {
  const newSquare = String(
    Number(snake[snake.length - 1]) + directions[direction]
  ).padStart(2, '0');

  const [row, column] = newSquare.split('');

  // Comprobamos colisiones
  if (
    Number(newSquare) < 0 ||
    Number(newSquare) >= boardSize * boardSize ||
    (direction === 'ArrowRight' && column == 0) ||
    (direction === 'ArrowLeft' && column == boardSize - 1) ||
    boardSquares[row][column] === squareTypes.snakeSquare
  ) {
    gameOver(); // ← función que deberías tener definida
    return;
  }

  // Si no hay colisión, mueve la serpiente
  snake.push(newSquare);

  if (boardSquares[row][column] === squareTypes.foodSquare) {
    createRandomFood(); // o addFood() si así la llamas
  } else {
    const emptySquare = snake.shift();
    drawSquare(emptySquare, 'emptySquare');
  }

  drawSnake();
};



const addFood = () => {
    score++;
    updateScore();
    createRandomFood();
}


const gameOver = () => {

gameOverSign.style.display = 'block';
clearInterval(moveInterval)
startButton.disabled=false;

}


const setDirection = newDirection => {
    direction= newDirection;
}


const directionEvent = key => {
    switch (key.code) {
        case 'ArrowUp': 
            direction != 'ArrowDown' && setDirection(key.code)
            break;
        case 'ArrowDown':
            direction != 'ArrowUp' && setDirection(key.code)
            break;
        case 'ArrowLeft':
            direction != 'ArrowRight' && setDirection(key.code)
            break;
        case 'ArrowRight':
            direction != 'ArrowLeft' && setDirection(key.code)
            break;                

    }
}



const createRandomFood = () => {
  const randomIndex = Math.floor(Math.random() * emptySquares.length); 
  //emptySquares.length → cantidad de casillas vacías.
  //Math.random() * emptySquares.length → elige un número aleatorio entre 0 y length - 1
  //Math.floor(...) → redondea hacia abajo para obtener un índice válido.
  //emptySquares[randomIndex] → accede a esa posición del array.

  const randomEmptySquare = emptySquares[randomIndex];
  drawSquare(randomEmptySquare, 'foodSquare');
  //drawSquare() para dibujar la comida.
};



const createRandomScore = () => {
    scoreBoard.innerText = score;
}


const updateScore = () => {
    scoreBoard.innerText = score; 
}


const createBoard = () => {
  boardSquares.forEach((row, rowIndex) => {
    row.forEach((column, columnIndex) => {
      const squareValue = `${rowIndex}${columnIndex}`;
      const squareElement = document.createElement('div');
      squareElement.setAttribute('class', 'square emptySquare');
      squareElement.setAttribute('id', squareValue);
      board.appendChild(squareElement);
      emptySquares.push(squareValue);
    });
  });
};


const setGame = () => { //Seteamos todo el juego
    snake = ['00', '01', '02', '03']; //Creamos la serpiente, es un array 2D y pintamos en la fila 0 las columnas 0-4.
    score=snake.length; //Cuando crezca la serpiente haremos que se sume 1.
    direction = 'ArrowRight'; //La dirección de la serpiente será desde un inicio la derecha.
    boardSquares = Array.from(Array(boardSize), () => new Array(boardSize).fill(squareTypes.emptySquare));
    console.log(boardSquares);
    board.innerHTML= '';
    emptySquares = []; //Vaciamos el array para empezar de 0
    createBoard(); //Creamos el tablero
}

const startGame = () => {
    setGame();
    gameOverSign.style.display = 'none'; //Ocultamos el GameOver por si es la segunda o tercera vez que juega
    startButton.disabled=true; //Bloqueamos el botón de Start durante la partida
    drawSnake(); //Función que pinta la serpiente
    updateScore(); //Actualizamos el score
    createRandomFood(); //Crear una nueva comida cada vez que se mueva la serpiente
    document.addEventListener('keydown', directionEvent);
    moveInterval = setInterval ( () => moveSnake(), gameSpeed);
}

startButton.addEventListener('click', startGame);
