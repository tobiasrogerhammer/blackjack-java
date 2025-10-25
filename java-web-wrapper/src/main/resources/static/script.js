// Blackjack Game JavaScript
console.log("Script.js loaded");

class BlackjackGame {
  constructor() {
    console.log("BlackjackGame constructor called");
    this.gameState = null;
    this.initializeElements();
    this.setupEventListeners();
    console.log("BlackjackGame initialized");
  }

  initializeElements() {
    this.dealerHand = document.getElementById("dealer-hand");
    this.playerHand = document.getElementById("player-hand");
    this.dealerValue = document.getElementById("dealer-value");
    this.playerValue = document.getElementById("player-value");
    this.gameStatus = document.getElementById("game-status");
    this.hitBtn = document.getElementById("hit-btn");
    this.standBtn = document.getElementById("stand-btn");
    this.newGameBtn = document.getElementById("new-game-btn");
    this.gameControls = document.getElementById("game-controls");
    this.newGameControls = document.getElementById("new-game-controls");
  }

  setupEventListeners() {
    console.log("Setting up event listeners");
    this.hitBtn.addEventListener("click", () => this.hit());
    this.standBtn.addEventListener("click", () => this.stand());
    this.newGameBtn.addEventListener("click", () => this.newGame());
    console.log("Event listeners set up");
  }

  async newGame() {
    try {
      console.log("Starting new game");
      const response = await fetch("/api/game/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "initialMoney=100",
      });

      const result = await response.json();
      if (result.success) {
        this.gameState = result.game;
        this.updateDisplay();
        this.showGameControls();
        this.showStatus("New game ready! Hit or Stand.", "info");
      } else {
        this.showStatus(result.error, "error");
      }
    } catch (error) {
      this.showStatus("Error starting new game: " + error.message, "error");
    }
  }

  async hit() {
    try {
      console.log("Hit button clicked");
      const response = await fetch("/api/game/hit", {
        method: "POST",
      });

      const result = await response.json();
      console.log("Hit response:", result);
      if (result.success) {
        this.gameState = result.game;
        console.log("After hit - game state:", this.gameState);
        console.log("Player hand value:", this.gameState.playerHandValue);
        console.log("Game status:", this.gameState.gameStatus);
        this.updateDisplay();

        // Only check game end if there's a game status
        if (
          this.gameState.gameStatus &&
          this.gameState.gameStatus !== "NEW_GAME"
        ) {
          this.checkGameEnd();
        }
      } else {
        this.showStatus(result.error, "error");
      }
    } catch (error) {
      this.showStatus("Error hitting: " + error.message, "error");
    }
  }

  async stand() {
    try {
      console.log("Stand button clicked");
      const response = await fetch("/api/game/stand", {
        method: "POST",
      });

      const result = await response.json();
      console.log("Stand response:", result);
      if (result.success) {
        this.gameState = result.game;
        this.updateDisplay();
        this.checkGameEnd();
      } else {
        this.showStatus(result.error, "error");
      }
    } catch (error) {
      this.showStatus("Error standing: " + error.message, "error");
    }
  }

  updateDisplay() {
    console.log("updateDisplay called, gameState:", this.gameState);
    if (!this.gameState) {
      console.log("No game state, returning");
      return;
    }

    // Update dealer hand
    this.updateHand(
      this.dealerHand,
      this.gameState.dealerHand,
      true,
      this.shouldHideDealerCard()
    );
    
    // Only show dealer value when game has ended
    if (this.gameHasEnded()) {
      this.dealerValue.textContent = `Value: ${this.gameState.dealerHandValue}`;
    } else {
      this.dealerValue.textContent = "Value: ?";
    }

    // Update player hand
    this.updateHand(this.playerHand, this.gameState.player.hand, false, false);
    this.playerValue.textContent = `Value: ${this.gameState.playerHandValue}`;
  }

  shouldHideDealerCard() {
    return (
      this.gameState.gameStatus === "NEW_GAME" ||
      this.gameState.gameStatus === null ||
      this.gameState.gameStatus === undefined
    );
  }

  gameHasEnded() {
    return (
      this.gameState.gameStatus === "PLAYER_WINS" ||
      this.gameState.gameStatus === "DEALER_WINS" ||
      this.gameState.gameStatus === "PLAYER_BUSTED" ||
      this.gameState.gameStatus === "DEALER_BUSTED" ||
      this.gameState.gameStatus === "PUSH"
    );
  }

  updateHand(handElement, cards, isDealer, hideFirstCard) {
    console.log("updateHand called", { isDealer, hideFirstCard, cards });
    handElement.innerHTML = "";

    if (!cards || cards.length === 0) {
      console.log("No cards to display");
      return;
    }

    cards.forEach((card, index) => {
      const cardElement = document.createElement("div");
      cardElement.className = "card";

      if (isDealer && hideFirstCard && index === 0) {
        cardElement.innerHTML = "🂠<br>Hidden";
        cardElement.classList.add("hidden-card");
        console.log("Hiding dealer's first card");
      } else {
        cardElement.innerHTML = `${card.suit} ${card.rank}`;
        console.log("Showing card:", card.suit, card.rank);
      }

      handElement.appendChild(cardElement);
    });
  }

  checkGameEnd() {
    console.log("checkGameEnd called, gameStatus:", this.gameState.gameStatus);
    if (this.gameState.gameStatus) {
      console.log("Game ended with status:", this.gameState.gameStatus);
      this.showNewGameControls();

      switch (this.gameState.gameStatus) {
        case "PLAYER_WINS":
          this.showStatus("🎉 You Win!", "win");
          break;
        case "DEALER_WINS":
          this.showStatus("😞 Dealer Wins!", "lose");
          break;
        case "PLAYER_BUSTED":
          this.showStatus("💥 You Busted!", "lose");
          break;
        case "DEALER_BUSTED":
          this.showStatus("🎉 Dealer Busted! You Win!", "win");
          break;
        case "PUSH":
          this.showStatus("🤝 Push! It's a tie!", "push");
          break;
        default:
          console.log("Unknown game status:", this.gameState.gameStatus);
          this.showStatus("Game ended", "info");
      }
    } else {
      console.log("No game status set");
    }
  }

  showStatus(message, type = "info") {
    this.gameStatus.textContent = message;
    this.gameStatus.className = `status ${type}`;
  }

  showGameControls() {
    this.gameControls.style.display = "block";
    this.newGameControls.style.display = "none";
  }

  showNewGameControls() {
    this.gameControls.style.display = "none";
    this.newGameControls.style.display = "block";
  }
}

// Initialize the game when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing BlackjackGame");
  new BlackjackGame();
});
