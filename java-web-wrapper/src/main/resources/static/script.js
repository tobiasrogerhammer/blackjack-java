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
    this.moneyDisplay = document.getElementById("money");
    this.betDisplay = document.getElementById("current-bet");
    this.dealerHand = document.getElementById("dealer-hand");
    this.playerHand = document.getElementById("player-hand");
    this.dealerValue = document.getElementById("dealer-value");
    this.playerValue = document.getElementById("player-value");
    this.gameStatus = document.getElementById("game-status");
    this.betAmount = document.getElementById("bet-amount");
    this.placeBetBtn = document.getElementById("place-bet-btn");
    this.hitBtn = document.getElementById("hit-btn");
    this.standBtn = document.getElementById("stand-btn");
    this.newGameBtn = document.getElementById("new-game-btn");
    this.betControls = document.getElementById("bet-controls");
    this.gameControls = document.getElementById("game-controls");
    this.newGameControls = document.getElementById("new-game-controls");
  }

  setupEventListeners() {
    console.log("Setting up event listeners");
    this.placeBetBtn.addEventListener("click", () => {
      console.log("Place bet button clicked");
      this.placeBet();
    });
    this.hitBtn.addEventListener("click", () => this.hit());
    this.standBtn.addEventListener("click", () => this.stand());
    this.newGameBtn.addEventListener("click", () => this.newGame());
    console.log("Event listeners set up");
  }

  async placeBet() {
    console.log("placeBet called");
    const amount = parseInt(this.betAmount.value);
    console.log("Bet amount:", amount);
    if (amount <= 0) {
      this.showStatus("Please enter a valid bet amount.", "error");
      return;
    }

    try {
      // Check if we already have a game with a bet
      if (this.gameState && this.gameState.player && this.gameState.player.currentBet > 0) {
        console.log("Game already has a bet, starting new game");
        this.startNewGame();
        return;
      }

      const response = await fetch("/api/game/bet", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `amount=${amount}`,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        console.error("Failed to parse JSON:", text);
        throw new Error("Invalid response from server");
      }

      if (result.success) {
        console.log("Bet successful, game state:", result.game);
        this.gameState = result.game;
        this.updateDisplay();
        this.showStatus("Bet placed! Game starting...", "info");
        // Start the game by dealing initial cards
        this.dealInitialCards();
      } else {
        this.showStatus(result.error, "error");
      }
    } catch (error) {
      this.showStatus("Error placing bet: " + error.message, "error");
    }
  }

  async dealInitialCards() {
    try {
      const response = await fetch("/api/game/deal", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        console.error("Failed to parse JSON:", text);
        throw new Error("Invalid response from server");
      }

      if (result.success) {
        console.log("Deal successful, game state:", result.game);
        this.gameState = result.game;
        this.updateDisplay();
        this.showGameControls();
        this.showStatus("Game started! Hit or Stand.", "info");
      } else {
        this.showStatus(result.error, "error");
      }
    } catch (error) {
      this.showStatus("Error dealing cards: " + error.message, "error");
    }
  }

  async startGame() {
    try {
      const response = await fetch("/api/game/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "initialMoney=100",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        console.error("Failed to parse JSON:", text);
        throw new Error("Invalid response from server");
      }

      if (result.success) {
        this.gameState = result.game;
        this.updateDisplay();
        this.showGameControls();
        this.showStatus("Game started! Hit or Stand.", "info");
      } else {
        this.showStatus(result.error, "error");
      }
    } catch (error) {
      this.showStatus("Error starting game: " + error.message, "error");
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
        this.checkGameEnd();
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

  async startNewGame() {
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
        this.showBetControls();
        this.showStatus("New game ready! Place a bet to start.", "info");
      } else {
        this.showStatus(result.error, "error");
      }
    } catch (error) {
      this.showStatus("Error starting new game: " + error.message, "error");
    }
  }

  async newGame() {
    try {
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
        this.showBetControls();
        this.showStatus("New game ready! Place a bet to start.", "info");
      } else {
        this.showStatus(result.error, "error");
      }
    } catch (error) {
      this.showStatus("Error starting new game: " + error.message, "error");
    }
  }

  updateDisplay() {
    console.log("updateDisplay called, gameState:", this.gameState);
    if (!this.gameState) {
      console.log("No game state, returning");
      return;
    }

    // Debug: Log the game state
    console.log("Game State:", this.gameState);

    // Update money and bet displays
    this.moneyDisplay.textContent = this.gameState.player.money;
    this.betDisplay.textContent = this.gameState.player.currentBet || 0;

    // Update hands - hide dealer's first card if game is still in progress
    const hideDealerCard =
      !this.gameState.gameStatus ||
      this.gameState.gameStatus === "NEW_GAME" ||
      this.gameState.gameStatus === null ||
      this.gameState.gameStatus === undefined;

    console.log("Game status:", this.gameState.gameStatus);
    console.log("Hide dealer card:", hideDealerCard);

    this.updateHand(
      this.dealerHand,
      this.gameState.dealerHand,
      true,
      hideDealerCard
    );
    this.updateHand(this.playerHand, this.gameState.player.hand, false, false);

    // Update hand values
    if (
      hideDealerCard &&
      this.gameState.dealerHand &&
      this.gameState.dealerHand.length > 1
    ) {
      // Show only the value of the visible card (second card)
      const visibleCardValue = this.gameState.dealerHand[1]
        ? this.gameState.dealerHand[1].value
        : 0;
      this.dealerValue.textContent = `Value: ${visibleCardValue}`;
    } else {
      this.dealerValue.textContent = `Value: ${
        this.gameState.dealerHandValue || 0
      }`;
    }
    this.playerValue.textContent = `Value: ${
      this.gameState.playerHandValue || 0
    }`;
  }

  updateHand(container, hand, isDealer = false, hideFirstCard = false) {
    console.log("updateHand called:", {
      isDealer,
      hideFirstCard,
      handLength: hand ? hand.length : 0,
    });
    container.innerHTML = "";

    if (hand && hand.length > 0) {
      hand.forEach((card, index) => {
        const cardElement = document.createElement("div");
        cardElement.className = "card";

        // Hide dealer's first card if specified
        if (isDealer && hideFirstCard && index === 0) {
          console.log("Hiding dealer's first card");
          cardElement.textContent = "🂠 Hidden";
          cardElement.classList.add("hidden-card");
        } else {
          cardElement.textContent = `${card.rank} of ${card.suit}`;

          // Color code red cards
          if (card.suit === "Hearts" || card.suit === "Diamonds") {
            cardElement.classList.add("red");
          }
        }

        container.appendChild(cardElement);
      });
    } else {
      container.innerHTML = "<p>No cards</p>";
    }
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

  showBetControls() {
    this.betControls.style.display = "block";
    this.gameControls.style.display = "none";
    this.newGameControls.style.display = "none";
  }

  showGameControls() {
    this.betControls.style.display = "none";
    this.gameControls.style.display = "block";
    this.newGameControls.style.display = "none";
  }

  showNewGameControls() {
    this.betControls.style.display = "none";
    this.gameControls.style.display = "none";
    this.newGameControls.style.display = "block";
  }
}

// Initialize the game when the page loads
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing BlackjackGame");
  new BlackjackGame();
});
