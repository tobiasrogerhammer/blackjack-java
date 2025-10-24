// File: src/main/java/BlackJack.java
import java.awt.*;
import java.awt.event.*;
import java.util.ArrayList;
import java.util.Random;
import javax.swing.*;

public class BlackJack {

	private class Card {
		String value;
		String type;

		Card(String value, String type) {
			this.value = value;
			this.type = type;
		}

		public String toString() {
			return value + "-" + type;
		}

		public int getValue() {
			// Face cards worth 10; Ace defaults to 11 (may be reduced later)
			if ("AJQK".contains(value)) {
				if (value.equals("A")) {
					return 11;
				}
				return 10;
			}
			return Integer.parseInt(value);
		}

		public boolean isAce() {
			return value.equals("A");
		}
	}

	ArrayList<Card> deck;
	Random random = new Random();

	Card hiddenCard;
	ArrayList<Card> dealerHand;
	int dealerSum;
	int dealerAceCount;

	ArrayList<Card> playerHand;
	int playerSum;
	int playerAceCount;

	final int boardWidth = 800;
	final int boardHeight = 600;

	JFrame frame = new JFrame("BlackJack");
	CanvasPanel tablePanel = new CanvasPanel();
	JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.CENTER));
	JButton hitButton = new JButton("Hit");
	JButton stayButton = new JButton("Stay");
	JButton restartButton = new JButton("Restart");

	boolean playerStands = false;
	boolean gameOver = false;
	String message = "Your turn: Hit or Stay?";

	public BlackJack() {
		startGame();

		// Frame
		frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		frame.setLayout(new BorderLayout());
		frame.add(tablePanel, BorderLayout.CENTER);

		// Buttons
		hitButton.setFocusable(false);
		stayButton.setFocusable(false);
		restartButton.setFocusable(false);

		buttonPanel.add(hitButton);
		buttonPanel.add(stayButton);
		buttonPanel.add(restartButton);
		frame.add(buttonPanel, BorderLayout.SOUTH);

		// Actions
		hitButton.addActionListener(e -> onHit());
		stayButton.addActionListener(e -> onStay());
		restartButton.addActionListener(e -> onRestart());

		frame.setSize(boardWidth, boardHeight);
		frame.setLocationRelativeTo(null);
		frame.setResizable(false);
		frame.setVisible(true);
	}

	public void startGame() {
		buildDeck();
		shuffleDeck();

		dealerHand = new ArrayList<>();
		dealerSum = 0;
		dealerAceCount = 0;

		// Dealer hidden card
		hiddenCard = drawCard();
		dealerSum += hiddenCard.getValue();
		dealerAceCount += hiddenCard.isAce() ? 1 : 0;

		// Dealer visible card
		Card card = drawCard();
		dealerSum += card.getValue();
		dealerAceCount += card.isAce() ? 1 : 0;
		dealerHand.add(card);

		// Player
		playerHand = new ArrayList<>();
		playerSum = 0;
		playerAceCount = 0;

		for (int i = 0; i < 2; i++) {
			Card p = drawCard();
			playerHand.add(p);
			playerSum += p.getValue();
			playerAceCount += p.isAce() ? 1 : 0;
		}

		playerSum = reduceAce(playerSum, playerAceCount);
		// Hidden not added to dealerHand list yet (only sum/aceCount)
		playerStands = false;
		gameOver = false;
		message = "Your turn: Hit or Stay?";

		// Debug logs
		System.out.println("Dealer (one hidden): " + hiddenCard + " + " + dealerHand);
		System.out.println("Player: " + playerHand + " sum=" + playerSum);
	}

	private Card drawCard() {
		return deck.remove(deck.size() - 1);
	}

	public void buildDeck() {
		deck = new ArrayList<>();
		String[] values = {"A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"};
		String[] types = {"C", "D", "H", "S"};

		for (String type : types) {
			for (String value : values) {
				deck.add(new Card(value, type));
			}
		}
	}

	public void shuffleDeck() {
		for (int i = 0; i < deck.size(); i++) {
			int j = random.nextInt(deck.size());
			Card tmp = deck.get(i);
			deck.set(i, deck.get(j));
			deck.set(j, tmp);
		}
	}

	private int reduceAce(int sum, int aceCount) {
		// Why: turn A(11) → A(1) until not bust
		while (sum > 21 && aceCount > 0) {
			sum -= 10;
			aceCount--;
		}
		return sum;
	}

	private void onHit() {
		if (gameOver || playerStands) return;

		Card p = drawCard();
		playerHand.add(p);
		playerSum += p.getValue();
		if (p.isAce()) playerAceCount++;

		playerSum = reduceAce(playerSum, playerAceCount);

		if (playerSum > 21) {
			// Player busts → reveal and settle
			revealHiddenCard();
			autoplayDealer(); // no-op except to normalize sums
			endGameWithOutcome();
		}

		tablePanel.repaint();
	}

	private void onStay() {
		if (gameOver) return;

		playerStands = true;
		revealHiddenCard();
		autoplayDealer();
		endGameWithOutcome();
		tablePanel.repaint();
	}

	private void revealHiddenCard() {
		if (hiddenCard != null) {
			dealerHand.add(0, hiddenCard);
			hiddenCard = null; // now visible
		}
	}

	private void autoplayDealer() {
		// Dealer hits until 17+ considering ace reductions
		dealerSum = 0;
		dealerAceCount = 0;
		for (Card c : dealerHand) {
			dealerSum += c.getValue();
			if (c.isAce()) dealerAceCount++;
		}
		dealerSum = reduceAce(dealerSum, dealerAceCount);

		while (dealerSum < 17) {
			Card c = drawCard();
			dealerHand.add(c);
			dealerSum += c.getValue();
			if (c.isAce()) dealerAceCount++;
			dealerSum = reduceAce(dealerSum, dealerAceCount);
		}
	}

	private void endGameWithOutcome() {
		gameOver = true;

		// Ensure sums normalized
		playerSum = reduceAce(playerSum, playerAceCount);
		dealerSum = reduceAce(dealerSum, dealerAceCount);

		if (playerSum > 21) {
			message = "You bust (" + playerSum + "). Dealer wins.";
		} else if (dealerSum > 21) {
			message = "Dealer busts (" + dealerSum + "). You win!";
		} else if (playerSum > dealerSum) {
			message = "You win! " + playerSum + " vs " + dealerSum;
		} else if (playerSum < dealerSum) {
			message = "Dealer wins. " + dealerSum + " vs " + playerSum;
		} else {
			message = "Push. " + playerSum + " = " + dealerSum;
		}

		hitButton.setEnabled(false);
		stayButton.setEnabled(false);
	}

	private void onRestart() {
		startGame();
		hitButton.setEnabled(true);
		stayButton.setEnabled(true);
		tablePanel.repaint();
	}

	private class CanvasPanel extends JPanel {
		CanvasPanel() {
			setPreferredSize(new Dimension(boardWidth, boardHeight));
			setBackground(new Color(53, 101, 77));
		}

		@Override
		protected void paintComponent(Graphics g) {
			super.paintComponent(g);
			Graphics2D g2 = (Graphics2D) g.create();
			g2.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

			int w = getWidth();
			int margin = 24;

			// Titles
			g2.setColor(Color.WHITE);
			g2.setFont(getFont().deriveFont(Font.BOLD, 22f));
			g2.drawString("Dealer", margin, 60);
			g2.drawString("Player", margin, 260);

			// Hands
			drawHand(g2, dealerHand, 90, hiddenCard != null); // if hiddenCard!=null, draw a backside placeholder
			drawHand(g2, playerHand, 290, false);

			// Sums
			g2.setFont(getFont().deriveFont(Font.PLAIN, 18f));
			String dealerSumText = hiddenCard != null ? "Dealer: ?"
					: "Dealer: " + reduceAce(dealerSum, dealerAceCount);
			String playerSumText = "Player: " + reduceAce(playerSum, playerAceCount);
			g2.drawString(dealerSumText, margin, 220);
			g2.drawString(playerSumText, margin, 420);

			// Message
			g2.setFont(getFont().deriveFont(Font.BOLD, 20f));
			g2.drawString(message, margin, 500);

			// Border line
			g2.setColor(new Color(255, 255, 255, 60));
			g2.drawLine(margin, 240, w - margin, 240);

			g2.dispose();
		}

		private void drawHand(Graphics2D g2, java.util.List<Card> hand, int y, boolean showHiddenBack) {
			int x = 24;
			int cardW = 70;
			int cardH = 100;
			int gap = 14;

			// Draw visible cards
			for (int i = 0; i < hand.size(); i++) {
				drawCardRect(g2, hand.get(i), x + i * (cardW + gap), y, cardW, cardH, false);
			}

			// Draw a facedown card for the dealer if needed
			if (showHiddenBack) {
				int hx = x + hand.size() * (cardW + gap);
				drawCardRect(g2, null, hx, y, cardW, cardH, true);
			}
		}

		private void drawCardRect(Graphics2D g2, Card c, int x, int y, int w, int h, boolean back) {
			// Card shape
			g2.setColor(Color.WHITE);
			g2.fillRoundRect(x, y, w, h, 10, 10);
			g2.setColor(Color.DARK_GRAY);
			g2.drawRoundRect(x, y, w, h, 10, 10);

			if (back) {
				// Simple back pattern
				g2.setColor(new Color(30, 70, 160));
				g2.fillRoundRect(x + 5, y + 5, w - 10, h - 10, 10, 10);
				return;
			}

			// Value & suit
			String text = c.value + suitSymbol(c.type);
			// Why: red for hearts/diamonds for immediate readability
			boolean white = "HD".contains(c.type);
			g2.setColor(white ? new Color(255, 255, 255) : Color.BLACK);
			g2.setFont(getFont().deriveFont(Font.BOLD, 18f));
			g2.drawString(text, x + 10, y + 24);
			g2.drawString(text, x + w - 10 - g2.getFontMetrics().stringWidth(text), y + h - 10);
		}

		private String suitSymbol(String t) {
			switch (t) {
				case "H": return "♥";
				case "D": return "♦";
				case "C": return "♣";
				case "S": return "♠";
				default:  return "?";
			}
		}
	}

	public static void main(String[] args) {
		SwingUtilities.invokeLater(BlackJack::new);
	}
}
