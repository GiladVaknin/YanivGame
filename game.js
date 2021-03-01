const yanivButton = document.getElementById("yaniv");
const dropedPile = document.getElementById("dropedPile");
const drawPile = document.getElementById("drawPile");
const board = document.getElementById("board");
const player1 = document.getElementById("player1");
const player2 = document.getElementById("player2");
const player3 = document.getElementById("player3");
const player4 = document.getElementById("player4");
const piles = document.getElementById("piles");

let gameLoaded = false;

function startNewGameWindow() {
  const startWindow = newElem("div", "startNewGame");
  const numOfPlayers = newElem("select", "numOfPlayers");
  const helloMessage = newElem("div", "helloMessage");
  helloMessage.innerText = "Welcome to Yaniv !\n\n Choose number of players.";
  const option1 = newElem("option", "option");
  const option2 = newElem("option", "option");
  const option3 = newElem("option", "option");
  const startButton = newElem("button", "startButton");
  startButton.innerText = "Start";
  option1.innerText = "2";
  option2.innerText = "3";
  option3.innerText = "4";
  numOfPlayers.append(option1);
  numOfPlayers.append(option2);
  numOfPlayers.append(option3);
  startWindow.append(numOfPlayers);
  startWindow.append(helloMessage);
  startWindow.append(startButton);
  board.append(startWindow);

  startButton.addEventListener("click", () => {
    let newGame = startNewGame(numOfPlayers.value);

    newGame.CardDeal();
    board.removeChild(startWindow);
    // printGame(newGame);
    gameLoaded = true;
    playTurn(newGame.starter, newGame);
  });
}

function startNewGame(numOfPlayers) {
  const game = new Game(numOfPlayers);
  return game;
}

function createCard(cardObj) {
  let url = cardObj.rank + cardObj.suit + ".jpg";
  let card = newElem("img", cardObj.rank + cardObj.suit);
  card.src = `./styles/cards/${url}`;
  card.className = "card";
  return card;
}

function printGame(game) {
  for (card of game.lastDroped) {
    cardImg = createCard(card);
    dropedPile.append(cardImg);
  }
  for (player of game.players) {
    let playerDiv = document.getElementById(player.name);
    for (card of player.cards) {
      cardImg = createCard(card);
      playerDiv.append(cardImg);
    }
    board.append(playerDiv);
  }
}

function playTurn(nowPlayer, gameState) {
  for (player of gameState.players) {
    let playersDivs = document.getElementById(player.name);
    playersDivs.innerHTML = "";
  }
  dropedPile.innerHTML = "";
  printGame(gameState);
  let cardsArr = [];
  let playerDiv = document.getElementById(nowPlayer.name);
  console.log(playerDiv);
  playerDiv.addEventListener("click", function chooseCards(e) {
    if (e.target.className !== "card") {
      return;
    }

    const cardSuitNRank = e.target.id;
    const cardObj = nowPlayer.stringToCardObj(cardSuitNRank);

    if (e.target.isChecked) {
      let cardPlace = cardsArr.indexOf(cardObj);
      cardsArr.splice(cardPlace, 1);
      e.target.isChecked = false;
      e.target.style.filter = "brightness(100%)";
    } else if (isLegalChoice(cardsArr, cardObj)) {
      cardsArr.push(cardObj);
      e.target.isChecked = true;
      e.target.style.filter = "brightness(50%)";
    }
  });

  piles.addEventListener("click", function placeCards(e) {
    console.log(e.target.parentNode);
    if (
      e.target.parentNode.id !== "drawPile" &&
      e.target.parentNode.id !== "dropedPile"
    ) {
      return;
    }
    if (cardsArr.length === 0) {
      return;
    }

    //TODO!! check which card of the dropedPile to take - first or last

    if (isLegalPut(cardsArr)) {
      gameState.dropedPile.push(...sortCards(cardsArr));
      nowPlayer.drawCard(gameState[drawFrom(e.target)], true);
      gameState.lastDroped = [];
      gameState.lastDroped.push(...sortCards(cardsArr));
      discardCardDom(nowPlayer, playerDiv, gameState.lastDroped);
    }

    // playerDiv.removeEventListener("click", chooseCards);

    let nextPlayer;
    if (gameState.players.indexOf(nowPlayer) === gameState.players.length - 1) {
      nextPlayer = gameState.players[0];
    } else {
      nextPlayer = gameState.players[gameState.players.indexOf(nowPlayer) + 1];
    }

    playTurn(nextPlayer, gameState);
    playerDiv.removeEventListener("click", placeCards);
  });
}

function sortCards(cardsArr) {
  const thereIsAJoker = cardsArr.some((card) => card.isJoker);
  if (!thereIsAJoker) {
    const sortedCards = cardsArr.sort(
      (a, b) => VALUES.indexOf(b.rank) - VALUES.indexOf(a.rank)
    );
    return sortedCards;
  } else {
    const noJokers = cardsArr.filter((card) => !card.isJoker);
    const jokerCards = cardsArr.filter((card) => card.isJoker);
    noJokers.sort((a, b) => VALUES.indexOf(b.rank) - VALUE.indexOf(a.rank));

    for (index in noJokers) {
      if (
        VALUES.indexOf(noJokers[index].rank) -
          VALUES.indexOf(noJokers[index + 1].rank) ===
        jokerCards.length + 1
      ) {
        noJokers.splice(index + 1, 0, ...jokerCards);
      }
    }
    for (index in cardsArr) {
      cardsArr.unshift(noJokers[index]);
      cardsArr.pop();
    }

    // return noJokers;
  }
}

// piles.addEventListener("click", (e) => {
//   console.log(e.target);
// });

function drawFrom(target) {
  if (target.id === "drawPile") return "drawingDeck";
  else return "lastDroped";
}

function discardCardDom(playerObj, playerDiv, cards) {
  for (card of cards) {
    let playerCard = document.getElementById(card.rank + card.suit);
    //dropedPile.innerHTML = "";
    playerObj.discardCard(card);
    // playerDiv.removeChild(playerCard);
    //dropedPile.append(playerCard);
  }
}

//מקבלת מערך של הקלפים שנבחרו, מחזירה טרו אם זה מהלך שחוקי להניח על השולחן
function isLegalPut(cardsArr) {
  //cards - "4H"
  let firstCardRank = cardsArr[0].rank;
  let isAllSameRank = cardsArr.every((card, index, arr) => {
    return card.rank === firstCardRank || card.isJoker; //joker is all values
  });

  if (cardsArr.length === 1) {
    return true;
  }

  if (isAllSameRank) {
    return true;
  } else {
    return cardsArr.length >= 3;
  }
}

document.addEventListener("onload", startNewGameWindow());

// playTurn(player1);

// document.addEventListener("onload", startNewGameWindow());

// playTurn(player1);
