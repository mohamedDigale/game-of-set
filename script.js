/* Constructors */

function Deck() {
  let colors = ["scarlet", "white", "black"];
  let shapes = ["buckeye", "leaf", "blockO"];
  let numbers = [1, 2, 3];
  let shades = ["filled", "shaded", "empty"];

  let cards = [];


  for (i in colors) {
    for (j in shapes) {
      for (k in numbers) {
        for (z in shades) {
          cards.push(new Card(colors[i], shapes[j], numbers[k], shades[z]));
        }
      }
    }
  }

  shuffle(cards);

  this.cards = cards;

  //only deal when inPlay less than 12 cards
  this.dealThreeCards = function () {
    let returnArray = [];
    if (cards.length > 2) {
      for (i = 0; i < 3; i++) {
        returnArray.push(this.cards.pop());
      }
    }
    return returnArray;
  };
}

function Card(color, shape, number, shade) {
  this.color = color;
  this.shape = shape;
  this.number = number;
  this.shade = shade;
}

/* Helpers */

function shuffle(deck) {
  for (let index = deck.length - 1; index > 0; index--) {
    let rand = Math.floor(Math.random() * (index + 1));
    let temp = deck[index];
    deck[index] = deck[rand];
    deck[rand] = temp;
  }
}

function cardsAreSet(cardOne, cardTwo, cardThree) {
  return (
    !!(
      (cardOne.color === cardTwo.color && cardTwo.color === cardThree.color) ||
      (cardOne.color !== cardTwo.color &&
        cardTwo.color !== cardThree.color &&
        cardOne.color !== cardThree.color)
    ) &&
    ((cardOne.shape === cardTwo.shape && cardTwo.shape === cardThree.shape) ||
      (cardOne.shape !== cardTwo.shape &&
        cardTwo.shape !== cardThree.shape &&
        cardOne.shape !== cardThree.shape)) &&
    ((cardOne.number === cardTwo.number &&
      cardTwo.number === cardThree.number) ||
      (cardOne.number !== cardTwo.number &&
        cardTwo.number !== cardThree.number &&
        cardOne.number !== cardThree.number)) &&
    ((cardOne.shade === cardTwo.shade && cardTwo.shade === cardThree.shade) ||
      (cardOne.shade !== cardTwo.shade &&
        cardTwo.shade !== cardThree.shade &&
        cardOne.shade !== cardThree.shade))
  );
}

function hintSet(inPlay) {
  hintsArray = [];
  for (i = 0; i < inPlay.length; i++) {
    for (j = i + 1; j < inPlay.length; j++) {
      for (k = j + 1; k < inPlay.length; k++) {
        if (cardsAreSet(inPlay[i], inPlay[j], inPlay[k])) {
          hintsArray.push([i, j, k]);
        }
      }
    }
  }
  return hintsArray;
}

function submitSelection(inPlay, select, deck, player) {
  // Are enough cards selected?
  if (select.length === 3) {
    // Enough cards selected, check for set
    if (cardsAreSet(inPlay[select[0]], inPlay[select[1]], inPlay[select[2]])) {
      // Cards are a set, remove selected cards from inPlay
      // Must remove last cards first so order before stays the same, so sort
      // Must define custom function to sort ints
      select.sort(function (a, b) {
        return a - b;
      });
      inPlay.splice(select[2], 1);
      inPlay.splice(select[1], 1);
      inPlay.splice(select[0], 1);
      // If there are less than 12 cards inPlay, deal three more if deck not empty
      let nextThreeCards = deck.dealThreeCards();
      if (inPlay.length < 12 && nextThreeCards.length > 0) {
        inPlay.push(...nextThreeCards);
      }
      displayModal("valid-set-modal", 3000);
      scoreboard(player);
    } else {
      // Not a valid set
      displayModal("invalid-set-modal", 3000);
    }
  } else {
    // Not enough cards selected
    displayModal("incorrect-number-modal", 3000)
  }
}

function requestCards(inPlay, deck) {
  if (inPlay.length < 21 && hintSet(inPlay).length === 0) {
    // there are no valid SETs in play and we are not at max cards (cannot be no set in 21 cards regardless)
    nextThreeCards = deck.dealThreeCards(); // will be empty if deck empty
    if (nextThreeCards.length === 0) {
      // no SETs but also deck is empty, the game is actually over
      displayModal("game-over-modal", 3000);
    } else {
      // no SETs, we will deal from the deck
      inPlay.push(...nextThreeCards);
    }
  } else {
    //There's a valid SET in play
    displayModal("set-in-play-modal", 3000);
  }
}

/* Front End Helpers */

function render(inPlay) {
  let cardsContainer = document.getElementById("cards-container");
  // Remove all old cards from display
  while (cardsContainer.firstChild) {
    cardsContainer.removeChild(cardsContainer.firstChild);
  }
  // Add all new cards to display
  for (card in inPlay) {
    let currentCard = document.createElement("div");
    currentCard.className = "card";
    currentCard.addEventListener("click", cardSelected);
    let currentImage = document.createElement("img");
    currentImage.setAttribute(
      "src",
      "images/" +
        inPlay[card].color +
        inPlay[card].shape +
        inPlay[card].shade +
        ".png"
    );
    for (i = 0; i < inPlay[card].number; i++) {
      currentCard.appendChild(currentImage.cloneNode(true));
    }
    cardsContainer.appendChild(currentCard);
  }
}

function cardSelected(event) {
  // If card image selected, get the parent
  let card = event.target;
  if (event.target.nodeName === "IMG") {
    card = event.target.parentNode;
  }
  // If selected, unselect, and vice versa
  if (card.className.includes("selected")) {
    card.className = "card";
  } else {
    // Check how many cards already selected
    let selectedCount = 0;
    Array.from(document.getElementsByClassName("card")).map((element) => {
      // If given card is selected
      if (element.className.includes("selected")) {
        // If there's already two selected cards and we found a third, unselect it
        if (selectedCount > 1) {
          element.className = "card";
        }
        selectedCount += 1;
      }
    });
    card.className = "card selected";
  }
}

function submitButtonClicked(playerNo, inPlay, deck) {
  let select = [];
  // Find index of selected cards from DOM
  Array.from(document.getElementsByClassName("card")).map((element, index) => {
    // If given card is selected, add index to selected array
    if (element.className.includes("selected")) {
      select.push(index);
    }
  });
  // Submit to submitSelection function
  submitSelection(inPlay, select, deck, playerNo);
  render(inPlay);
}

function hintButtonClicked(inPlay) {
  hints = hintSet(inPlay);
  // If there are no sets in play
  if (hints.length === 0) {
    displayModal("no-sets-modal", 3000);
  } else {
    currCards = Array.from(document.getElementsByClassName("card"));
    hints[0].forEach(function (hintIndex, indexInHint) {
      // Only display hint for two cards
      if (indexInHint < 2) {
        let originalClass = currCards[hintIndex].className;
        currCards[hintIndex].className += " hint";
        setTimeout(function () {
          currCards[hintIndex].className = originalClass;
        }, 500);
      }
    });
  }
}

function requestCardsButtonClicked(inPlay, deck) {
  requestCards(inPlay, deck);
  render(inPlay);
}

function scoreboard(player) {
  // Searches players by tag id and increments score
  var score;
  switch (player) {
    case 1:
      score = Number(document.getElementsByTagName("p")[0].innerHTML);
      document.getElementById("1").innerHTML = ++score;
      break;

    case 2:
      score = Number(document.getElementsByTagName("p")[1].innerHTML);
      document.getElementById("2").innerHTML = ++score;
      break;

    case 3:
      score = Number(document.getElementsByTagName("p")[2].innerHTML);
      document.getElementById("3").innerHTML = ++score;
      break;

    case 4:
      score = Number(document.getElementsByTagName("p")[3].innerHTML);
      document.getElementById("4").innerHTML = ++score;
      break;

    case 5:
      score = Number(document.getElementsByTagName("p")[4].innerHTML);
      document.getElementById("5").innerHTML = ++score;
      break;

    case 6:
      score = Number(document.getElementsByTagName("p")[5].innerHTML);
      document.getElementById("6").innerHTML = ++score;
      break;
  }

}

function displayModal(modalId, timeout) {
  document.getElementById(modalId).style.display = "block";
  if (timeout > 0) {
    setTimeout(function() {
      document.getElementById(modalId).style.display = "none";
    }, timeout);
  }
}

/* Main Script */

let deck = new Deck();

let inPlay = [];
while (inPlay.length < 12) {
  // Spreading returned array in order to fill inPlay array
  inPlay.push(...deck.dealThreeCards());
}

render(inPlay);

/* Add button listeners */

document.getElementById("hint-button").addEventListener("click", function () {
  hintButtonClicked(inPlay);
});

document
  .getElementById("request-cards-button")
  .addEventListener("click", function () {
    requestCardsButtonClicked(inPlay, deck);
  });

document.getElementById("tutorial-button").addEventListener("click", function() {
  displayModal("tutorial-modal", 0);
});

// Modal and content listeners
Array.from(document.getElementsByClassName("modal")).forEach(function(modal, index) {
  modal.addEventListener("click", function () {
    modal.style.display = "none";
  });
  modal.firstChild.addEventListener("click", function () {
    modal.style.display = "none";
  });
});

//Holds list of players
var playersArray = new Array();
  
  
//Get Elemements that will be altered
let addPlayerButton = document.getElementById("add-player");
let scoreBoard = document.getElementById("score-container");
let playerInput = document.getElementById("player-input");

//Eventlistener for click on add-player Button
addPlayerButton.addEventListener("click", function () {

  if (playersArray.length > 5) {

    // Limit number of players to s6
    displayModal("too-many-players-modal", 3000);

  } else {

    //Add the player name into the list
    playersArray.push(playerInput.value);
    
    //Create a div, inside it put paragraph to display the players who have entered
    var div = document.createElement("div");
    div.classList.add("player-score");
    var scoreButton = document.createElement("button");
    scoreButton.classList.add("player-submit-button");
    var p = document.createElement("p");
    p.id = playersArray.length;


    //set the player input inside the paragraph tag
    scoreButton.innerText = playerInput.value;
    scoreButton.name = playersArray.length;
    // Event listener for when player scoreboard button is click
    scoreButton.addEventListener("click", function () {
      submitButtonClicked(Number(this.name), inPlay, deck);
    })
    p.innerText="0";

    div.appendChild(scoreButton);
    div.appendChild(p);

    scoreBoard.appendChild(div);
    playerInput.value = "";
  }

});
