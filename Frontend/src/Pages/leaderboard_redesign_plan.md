Task: Enhance Leaderboard UI and Sections

1.  **Tab System**:
    - Add a `activeTab` state in `Leaderboard.jsx` ('worldwide' vs 'personal').
    - Create a modern, animated Tab Switcher.

2.  **Worldwide Tab**:
    - Refine `playerRow` CSS to be more compact.
    - Add rank icons/badges (🏆, 🥈, 🥉).
    - Ensure 5+ rows fit within the `82vh` card.

3.  **My Stats Tab**:
    - Fetch user profile using `fetchProfileFun`.
    - Display a premium "User Card" with stats (Wins, Losses, Total Games, Win Rate).

4.  **Aesthetics**:
    - Update `Leaderboard.module.css` with smoother transitions and better spacing.
    - Use vibrant gradients for stats indicators.
    - Add staggered entry animations for list items.
