// paper-sprint-rider v1.1: a late-curve momentum bot for the make.fun pump.fun replay
// (agent-fun/replay/v2).
//
// The grader runs `node /bot/main.ts`; the strategy lives in strategy.ts and the SDK shim is the
// kit's sdk/ts/makefun-bot.ts-compatible shim, vendored byte for byte. See STRATEGY.md for the
// design, the parameter sweep and how the dev window was used to pick the fee-budget settings.

import { runBot } from './vendor/agentfun-bot.ts';
import { createStrategy, DEFAULT_PARAMS } from './strategy.ts';

await runBot(createStrategy(DEFAULT_PARAMS));
