package com.tobias.blackjack.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Represents the main game logic for Blackjack
 * 
 * This class should be replaced with your existing Game class
 * from your original Blackjack project.
 */
public class Game {
    private Player player;
    private List<Card> dealerHand;
    private List<Card> deck;
    private boolean isPlayerTurn;
    private String gameStatus;

    public Game(Player player) {
        this.player = player;
        this.dealerHand = new ArrayList<>();
        this.deck = createDeck();
        this.isPlayerTurn = true;
        this.gameStatus = "NEW_GAME";
    }

    private List<Card> createDeck() {
        List<Card> deck = new ArrayList<>();
        String[] suits = {"Hearts", "Diamonds", "Clubs", "Spades"};
        String[] ranks = {"Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"};
        int[] values = {11, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10};

        for (String suit : suits) {
            for (int i = 0; i < ranks.length; i++) {
                deck.add(new Card(suit, ranks[i], values[i]));
            }
        }
        
        Collections.shuffle(deck);
        return deck;
    }

    public void dealInitialCards() {
        player.addCard(deck.remove(0));
        dealerHand.add(deck.remove(0));
        player.addCard(deck.remove(0));
        dealerHand.add(deck.remove(0));
    }

    public void playerHit() {
        if (isPlayerTurn && !player.isBusted()) {
            player.addCard(deck.remove(0));
            if (player.isBusted()) {
                isPlayerTurn = false;
                gameStatus = "PLAYER_BUSTED";
            }
        }
    }

    public void playerStand() {
        if (isPlayerTurn) {
            isPlayerTurn = false;
            dealerPlay();
        }
    }

    private void dealerPlay() {
        while (getDealerValue() < 17) {
            dealerHand.add(deck.remove(0));
        }
        
        if (getDealerValue() > 21) {
            gameStatus = "DEALER_BUSTED";
        } else if (getDealerValue() > player.getHandValue()) {
            gameStatus = "DEALER_WINS";
        } else if (player.getHandValue() > getDealerValue()) {
            gameStatus = "PLAYER_WINS";
        } else {
            gameStatus = "PUSH";
        }
    }

    public int getDealerValue() {
        int value = 0;
        int aces = 0;
        
        for (Card card : dealerHand) {
            if (card.getRank().equals("Ace")) {
                aces++;
                value += 11;
            } else {
                value += card.getValue();
            }
        }
        
        while (value > 21 && aces > 0) {
            value -= 10;
            aces--;
        }
        
        return value;
    }

    public void placeBet(int amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Bet amount must be positive");
        }
        if (amount > player.getMoney()) {
            throw new IllegalArgumentException("Insufficient funds. You have $" + player.getMoney());
        }
        if (player.getCurrentBet() > 0) {
            throw new IllegalStateException("You have already placed a bet for this game");
        }
        
        player.setCurrentBet(amount);
        player.setMoney(player.getMoney() - amount);
    }

    // Getters and setters
    public Player getPlayer() {
        return player;
    }

    public void setPlayer(Player player) {
        this.player = player;
    }

    public List<Card> getDealerHand() {
        return dealerHand;
    }

    public void setDealerHand(List<Card> dealerHand) {
        this.dealerHand = dealerHand;
    }

    public boolean isPlayerTurn() {
        return isPlayerTurn;
    }

    public void setPlayerTurn(boolean playerTurn) {
        isPlayerTurn = playerTurn;
    }

    public String getGameStatus() {
        return gameStatus;
    }

    public void setGameStatus(String gameStatus) {
        this.gameStatus = gameStatus;
    }

    // Additional getters for frontend
    public int getDealerHandValue() {
        return getDealerValue();
    }

    public int getPlayerHandValue() {
        return player.getHandValue();
    }
}
