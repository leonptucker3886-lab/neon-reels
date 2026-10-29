# NEON REELS

A free neon slot machine that runs in the browser. Play money only — nothing to buy, no cash-out, nothing to lose. 18+.

Five reels, twenty paylines, wild bolts, moon scatters, free spins at ×2 and a progressive jackpot, wrapped in a chasing-bulb neon cabinet.

## Game

- **Reels**: 5 × 3, 20 fixed paylines, weighted strips with a staggered decelerating spin.
- **Wild Bolt**: substitutes for everything except the scatter, pays up to 45× and takes the progressive jackpot on five of a kind.
- **Moon scatter**: pays anywhere and awards 10 / 15 / 20 free spins, all wins doubled.
- **Win tiers**: BIG at 8×, MEGA at 15×, EPIC at 25× of total bet, each with its own colour ramp, ray halo, shake and confetti; the jackpot has its own gold showpiece.
- **Controls**: turbo, autoplay (10/25/50, stops on a 20×+ win), bet ladder with MAX, paytable, and keyboard shortcuts (Space, ↑/↓, T).
- **Persistence**: balance, bet and the progressive meter live in `localStorage`; there is a +10,000 refuel if the balance bottoms out.

Return to player is roughly 95.7% over a long run, so the balance drifts down rather than up.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Markup, cabinet, overlays, paytable shell |
| `style.css` | Neon presentation layer, win-tier treatments, reduced-motion support |
| `game.js` | Reel engine, payline evaluation, free spins, jackpot, particles |

No build step and no dependencies: open `index.html`, or serve the folder with any static server.

The visual language follows [AFTERGLOW](https://afterglow.leonlink.net).
