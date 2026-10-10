// Token selection for pay_and_call: prove the buyer narrows a challenge's
// accepts[] to the caller's chosen asset (USDC default, $THREE opt-in), and
// fails open when the preference isn't offered. Pure logic — no wallet, no
// network, no on-chain settlement.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { filterAcceptsByToken, isThreeAccept, isUsdcAccept } from '../src/lib/x402-buyer.js';

const THREE_MINT = 'FeMbDoX7R1Psc4GEcvJdsbNbZA3bfztcyDCatJVJpump';
const USDC_SOL = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

// A USDC + $THREE Solana challenge, USDC-first (the platform's ordering).
const ACCEPTS = [
	{ network: 'solana:mainnet', asset: USDC_SOL, amount: '10000', extra: { name: 'USDC', decimals: 6 } },
	{ network: 'solana:mainnet', asset: THREE_MINT, amount: '10000000', extra: { name: 'THREE', decimals: 6 } },
	{ network: 'eip155:8453', asset: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', amount: '10000', extra: { name: 'USD Coin' } },
];

test('classifiers identify each asset by name or mint', () => {
	assert.equal(isUsdcAccept(ACCEPTS[0]), true);
	assert.equal(isThreeAccept(ACCEPTS[1]), true);
	assert.equal(isUsdcAccept(ACCEPTS[2]), true); // Base "USD Coin"
	assert.equal(isThreeAccept(ACCEPTS[0]), false);
});

test("token 'three' narrows to only the $THREE accept", () => {
	const got = filterAcceptsByToken(ACCEPTS, 'three');
	assert.equal(got.length, 1);
	assert.equal(got[0].asset, THREE_MINT);
	assert.equal(got[0].extra.name, 'THREE');
});

test("token 'usdc' narrows to USDC accepts (both lanes)", () => {
	const got = filterAcceptsByToken(ACCEPTS, 'usdc');
	assert.equal(got.length, 2);
	assert.ok(got.every(isUsdcAccept));
});

test('fails open: preferring $THREE when none is offered keeps the original accepts', () => {
	const usdcOnly = [ACCEPTS[0], ACCEPTS[2]];
	const got = filterAcceptsByToken(usdcOnly, 'three');
	assert.deepEqual(got, usdcOnly);
});
