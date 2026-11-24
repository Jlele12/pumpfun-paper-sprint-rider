# Strategy: late-curve momentum rider with fee-budget pacing

The bot trades pump.fun bonding curves in the `agent-fun/replay/v2` replay. Design goals, in
order: (1) always meet the guardrail bar (a round trip of >= 0.01 SOL on >= 20 distinct coins,
max drawdown <= 50%), (2) never bleed fees on churn, (3) put real size only into tapes that are
still being bought by many different wallets near the top of their short window.

## Guardrail pacing (always on)

Round-trip probes of exactly `probeSol` (0.01 SOL) are opened and closed as soon as they land,
on liquid curves, whenever the bot's own coin or fill count lags the pace the guardrails imply
(`targetCoins` 22 coins, `targetFills` 45 fills over `paceSecs` 4 hours). This keeps the bar met
at a hard floor of fee cost (~0.016 SOL over the 6-hour dev window, drawdown 0.2%). Probe targets
are deliberately just above the bar: every extra round trip is pure fee.

## Entries (rare, deliberate)

A curve is bought (0.3 SOL first tranche, up to 0.5 SOL total) only when its last 30 slots show:
net inflow of >= 8 SOL, >= 6 buys from >= 6 distinct wallets, price up 5-150% sitting within 5%
of its window high, the newer half of the window's net inflow at least 1.5x the older half's, no
single wallet above 30% of window buy SOL, and the curve already holds 60-200 real SOL (mature,
past 1500 slots since create). The `maxBuyerShare: 0.3` filter is the rug killer: launches
bundled by one wallet cluster are excluded from entries entirely.

## Exits

Positions ride: no trailing stop until armed (0.2 above cost), no time limit (`maxHold`
100000 slots), fade/big-sell exits off, and once a curve passes 25 real SOL the trailing stops
are fully disarmed (`rideRqSol: 25`) so a genuine runner is held to curve completion, where the
replay closes the position at final reserves. A hard 5% stop against cost is the only exit
while not riding. One entry per curve (`maxEntries: 1`), 300-slot cooldown.

## Why these settings

A sweep over the kit's dev window (`tools/sweep.ts`, mean over four failed-tx keys) showed every
high-churn configuration loses to fees: the bonding-curve spread plus tx fees dominate any
scalp. The settings above are the low-churn optimum: dev net -0.016 SOL, 46 fills, 22 coins,
max drawdown 0.002. The upside is carried by the rare rider positions, which are sized small so
a bad tape costs little and a completion pays.

Run offline: `node tools/backtest.ts <kit dir>`; sweep: `node tools/sweep.ts <kit dir> '<base>' '<grid>'`.
Deterministic by construction: no clock, no randomness, iteration only over insertion-ordered
maps fed by the batch stream - the two graded executions match byte for byte.
