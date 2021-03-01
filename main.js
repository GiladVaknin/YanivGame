const SUITS = ["H", "D", "S", "C"];
const VALUES = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

class Card {
  constructor(suit, rank) {
    this.suit = suit;
    this.rank = rank;
    this.isJoker = this.rank === "JOKER";
  }
}

class Deck {
  constructor(cards = freshDeck()) {
    this.cards = cards;
  }

  get numberOfCards() {
    return this.cards.length;
  }

  shuffle() {
    for (let i = this.numberOfCards - 1; i > 0; i--) {
      const newIndex = Math.floor(Math.random() * (i + 1));
      const oldValue = this.cards[newIndex];
      this.cards[newIndex] = this.cards[i];
      this.cards[i] = oldValue;
    }
  }
}

class Player {
  constructor(name) {
    this.name = name;
    this.cards = new PlayerDeck().cards;
    this.cardSum;
    this.yanivAble = () => {
      if (this.cardSum <= 7) return true;
      return false;
    };
    this.score = 0;
    this.stillPlaying = () => {
      if (score < 200) return false;
      return true;
    };
  }

  get cardSum() {
    let sum = 0;
    for (let card of this.cards) {
      if (isNaN(card.rank)) {
        switch (card.rank) {
          case "K": {
            sum += 10;
            break;
          }
          case "JOKER": {
            break;
          }
          case "J": {
            sum += 10;
            break;
          }
          case "Q": {
            sum += 10;
            break;
          }
          case "A":
            sum += 1;
            break;
        }
      } else {
        sum += Number(card.rank);
      }
    }
    return sum;
  }

  discardCard(card) {
    const cardPlace = this.cards.indexOf(card);
    this.cards.splice(cardPlace, 1);
  }

  drawCard(drawingDeck, first = false) {
    if (first) {
      this.cards.push(drawingDeck.shift());
    } else {
      this.cards.push(drawingDeck.pop());
    }
  }

  stringToCardObj(cardId) {
    if (cardId === "JOKERred") {
      return this.cards.find((card) => card.isJoker && card.suit === "red");
    } else if (cardId === "JOKERblack") {
      return this.cards.find((card) => card.isJoker && card.suit === "black");
    } else {
      if (cardId.length === 3) {
        const suit = cardId[2];
        const rank = cardId[0] + cardId[1];
        return this.cards.find(
          (cardObj) => cardObj.suit === suit && cardObj.rank === rank
        );
      } else {
        const suit = cardId[1];
        const rank = cardId[0];
        return this.cards.find(
          (cardObj) => cardObj.suit === suit && cardObj.rank === rank
        );
      }
    }
  }
}

class TableDeck extends Deck {
  constructor(cards = freshDeck()) {
    super(cards);
    this.cards.push(new Card("red", "JOKER"));
    this.cards.push(new Card("black", "JOKER"));
    this.shuffle();
  }
}

class PlayerDeck extends Deck {
  constructor(cards = []) {
    super(cards);
  }
}

class PileDeck extends Deck {
  constructor(cards = []) {
    super(cards);
  }
}

class Game {
  constructor(playersNum) {
    this.drawingDeck = new TableDeck().cards;
    this.players = createPlayers(playersNum);
    this.dropedPile = [];
    this.round = 0;
    this.starter = this.players[Math.floor(Math.random() * playersNum)];
    this.lastDroped = [];
  }

  CardDeal() {
    for (let i = 0; i < 5; i++) {
      for (let player of this.players) {
        player.cards.push(this.drawingDeck.pop());
      }
    }
    this.lastDroped.push(this.drawingDeck.pop());
  }

  winnerFounder() {
    let winner = this.players[0];
    for (let player of this.players) {
      if (winner.cardSum > player.cardSum) {
        winner = player;
      }
    }
    return winner;
  }
}

function createPlayers(playersNum) {
  let p = [];
  for (let i = 1; i <= playersNum; i++) {
    p.push(new Player("player" + i));
  }
  return p;
}

function newElem(type, id) {
  let elem = document.createElement(type);
  if (id) elem.id = id;
  return elem;
}

function freshDeck() {
  return SUITS.flatMap((suit) => {
    return VALUES.map((rank) => {
      return new Card(suit, rank);
    });
  });
}
// receives ordered array
// console.log(game.players[0].cards);

function isLegalChoice(selectedCards, cardToSelect) {
  if (selectedCards.length === 0 || cardToSelect.isJoker) return true;
  if (
    selectedCards.every(
      (selectedCard) =>
        selectedCard.rank === cardToSelect.rank || selectedCard.isJoker
    )
  )
    return true;
  let cardToSelValue = VALUES.indexOf(cardToSelect.rank);
  if (
    selectedCards.every(
      (selectedCard) =>
        selectedCard.suit === cardToSelect.suit || selectedCard.isJoker
    )
  ) {
    const below = cardToSelValue - VALUES.indexOf(selectedCards[0].rank);
    const above =
      cardToSelValue -
      VALUES.indexOf(selectedCards[selectedCards.length - 1].rank);
    if (below === -1 || above === 1) return true;
    else if (Math.abs(below) > 1 || Math.abs(above) > 1) {
      const numberOfJokers = selectedCards.reduce((prev, card) => {
        if (card.isJoker) {
          prev++;
        }
      }, 0);
      for (card of selectedCards) {
        if (
          Math.abs(cardToSelValue - VALUES.indexOf(card.rank)) <=
          numberOfJokers + 1
        ) {
          return true;
        }
      }
    }
  }
  return false;
}
/* function isLegalChoice(selectedCards, cardToSelect) {
  if (selectedCards.length === 0 || cardToSelect.isJoker) return true;
  if (
    selectedCards.every(
      (selectedCard) =>
        selectedCard.rank === cardToSelect.rank || selectedCard.isJoker
    )
  )
    return true;
  if (
    selectedCards.every(
      (selectedCard) =>
        selectedCard.suit === cardToSelect.suit || selectedCard.isJoker
    )
  ) {
    const below =
      VALUES.indexOf(cardToSelect.rank) - VALUES.indexOf(selectedCards[0].rank);
    const above =
      VALUES.indexOf(cardToSelect.rank) -
      VALUES.indexOf(selectedCards[selectedCards.length - 1].rank);
    if (below === -1 || above === 1 || below === NaN || above === NaN)
      return true;
  }
  return false;
} */
