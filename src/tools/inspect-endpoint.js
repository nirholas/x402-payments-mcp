// `inspect_endpoint` — read an x402 endpoint's payment requirements WITHOUT
// paying. Read-only, no signer needed. The safe way to learn what a call costs
// before committing money with pay_and_call.

import { z } from 'zod';

import { probeChallenge } from '../lib/x402-buyer.js';

export const def = {
	name: 'inspect_endpoint',
	title: 'Inspect an x402 endpoint (price + requirements, no payment)',
	annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: true },
	description:
		'Fetch an x402 endpoint and return its 402 payment requirements — every accepted scheme, network, asset, price and pay-to address — WITHOUT paying. If the endpoint is free, returns its result instead. No signer required. Use this to learn the cost before pay_and_call.',
	inputSchema: {
		url: z.string().url().describe('The x402 endpoint URL to inspect.'),
		method: z.enum(['GET', 'POST']).default('GET').describe('HTTP method to probe with.'),
		body: z.record(z.any()).optional().describe('JSON body for a POST probe.'),
	},
	async handler(args) {
		const url = String(args?.url ?? '').trim();
		const method = args?.method === 'POST' ? 'POST' : 'GET';
		const probe = await probeChallenge(url, { method, body: args?.body });
		if (!probe.paid) {
			return {
				ok: true,
				url,
				paid: false,
				status: probe.status,
				note: 'Endpoint is not paywalled (no 402) — call it directly.',
				result: probe.result,
			};
		}
		const accepts = probe.accepts.map((a) => ({
			scheme: a.scheme,
			network: a.network,
			price: a.price ?? a.maxAmountRequired ?? undefined,
			asset: a.asset ?? a.extra?.asset ?? undefined,
			pay_to: a.payTo ?? undefined,
			max_timeout_seconds: a.maxTimeoutSeconds ?? undefined,
		}));
		return {
			ok: true,
			url,
			paid: true,
			accepts,
			payable_with_this_wallet: accepts.some((a) => String(a.network || '').startsWith('solana')),
			note: 'This wallet settles Solana (solana:*) requirements. pay_and_call to pay and run it.',
		};
	},
};
