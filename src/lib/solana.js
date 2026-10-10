// Read-only Solana balance helper for x402_wallet. Live RPC only — no mocks.

import { SOLANA_RPC_URL, USDC_MAINNET_MINT } from '../config.js';

/**
 * Read the SOL and USDC balance of a Solana address.
 * @param {string} address base58 pubkey
 * @returns {Promise<{ sol: number, usdc: number|null }>}
 */
export async function getBalances(address) {
	const { Connection, PublicKey } = await import('@solana/web3.js');
	const { getAssociatedTokenAddressSync } = await import('@solana/spl-token');
	const conn = new Connection(SOLANA_RPC_URL, 'confirmed');
	const owner = new PublicKey(address);

	const lamports = await conn.getBalance(owner);
	const sol = lamports / 1e9;

	let usdc = null;
	try {
		const ata = getAssociatedTokenAddressSync(new PublicKey(USDC_MAINNET_MINT), owner, true);
		const bal = await conn.getTokenAccountBalance(ata);
		usdc = bal?.value?.uiAmount ?? 0;
	} catch {
		// No USDC ATA yet → treat as zero, not an error.
		usdc = 0;
	}
	return { sol, usdc };
}
