package com.tobias.blackjack.service;

import com.tobias.blackjack.model.Game;
import com.tobias.blackjack.model.Player;
import org.springframework.stereotype.Service;

/**
 * Service class for managing the Blackjack game logic
 * 
 * This service handles the core game functionality and maintains
 * the current game state for web requests.
 */
@Service
public class GameService {

    private Game currentGame;

    /**
     * Start a new game
     */
    public Game startNewGame(int initialMoney) {
        Player player = new Player();
        currentGame = new Game(player);
        return currentGame;
    }

    /**
     * Player hits (takes another card)
     */
    public Game hit() {
        if (currentGame == null) {
            throw new IllegalStateException("No active game. Please start a new game first.");
        }
        
        if (!currentGame.isPlayerTurn()) {
            throw new IllegalStateException("It's not your turn to hit.");
        }
        
        currentGame.playerHit();
        return currentGame;
    }

    /**
     * Player stands (stops taking cards)
     */
    public Game stand() {
        if (currentGame == null) {
            throw new IllegalStateException("No active game. Please start a new game first.");
        }
        
        if (!currentGame.isPlayerTurn()) {
            throw new IllegalStateException("It's not your turn to stand.");
        }
        
        currentGame.playerStand();
        return currentGame;
    }


    /**
     * Deal initial cards to start the game
     */
    public Game dealInitialCards() {
        if (currentGame == null) {
            throw new IllegalStateException("No active game. Please place a bet first.");
        }
        
        currentGame.dealInitialCards();
        return currentGame;
    }

    /**
     * Get the current game state
     */
    public Game getCurrentGame() {
        if (currentGame == null) {
            throw new IllegalStateException("No active game. Please start a new game first.");
        }
        return currentGame;
    }

    /**
     * Check if there's an active game
     */
    public boolean hasActiveGame() {
        return currentGame != null;
    }
}
