# Ante ♣

**Not everyone saves the same way.**

Ante is a savings-goal app that lets you choose how you want to be motivated. Instead of one mechanic for everyone, you pick a "nudge" — a theme built on a specific psychological driver — so the app fits how your brain actually works.

Built in 55 hours for SASEhack 2026.

---

## What it does

- Set a savings goal with a target amount and contribution frequency
- Ante auto-calculates your contribution schedule
- Pick a nudge — the motivation style that works for you
- Log contributions and watch your goal's journey move
- Add a photo to each goal so you're saving toward the real thing
- Runs entirely in the browser — no account, no bank connection, no backend

## The idea

Every gamified savings app uses one metaphor — grow a plant, feed a pet, fill a jar — for every user. If that metaphor doesn't match how you're motivated, you quit.

Behavioral psychology splits motivation into different drivers: positive reinforcement, responsibility, tangible reward, urgency. Ante lets you choose the one that works on you.

Same savings engine underneath. Different nudge on top.

## The nudges

| Theme | Driver | Built for |
|---|---|---|
| **The Lotus** | Positive reinforcement — only grows, never wilts, never punishes | People who get discouraged and quit |
| **The Hungry Pup** | Responsibility — something depends on you showing up | People who need a reason to open the app |
| **The Long Ride** | Tangible reward — watch the actual goal get closer | People who like seeing progress |
| **The Thirsty Crow** | Urgency — act now, not someday | People who don't move without a push |

## How it works

1. **Set a goal** — what you're saving for, target amount, contribution frequency (daily / weekly / biweekly / monthly / yearly)
2. **Ante does the math** — e.g. `$50 every week for 24 weeks`
3. **Pick your nudge** — choose a theme
4. **Ante up** — log a contribution
5. **Watch it move** — each theme has its own animated journey and payoff at 100%

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React + Vite |
| Styling | Tailwind CSS |
| Animation | Framer Motion, Lottie |
| State | React hooks |
| Persistence | Browser `localStorage` |

## Getting started

Requires [Node.js](https://nodejs.org) v18+.

```bash
git clone https://github.com/[your-username]/ante.git
cd ante
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

### Other commands

```bash
npm run build     # production build → dist/
npm run preview   # preview the production build
```

## What's next

- Shared goals — save toward one thing with a friend
- Nudge quiz — a 30-second quiz that recommends your theme
- More themes — milestones (The Mountain), streaks (The Campfire)

## Team
- Manal Asad
- Nikita Sharma
- Sneh Mistry

Built for SASEhack 2026.


