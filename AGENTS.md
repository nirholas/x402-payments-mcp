# AGENTS.md

Guidance for AI coding agents working in this repository.

## What this is

`@three-ws/x402-mcp` v0.2.3. Give any AI agent a self-custodial x402 wallet. Search the live bazaar, inspect an endpoint's price without paying, and pay_and_call any x402 service in USDC or $THREE from your own Solana key — real @x402 settlement, bounded by spend caps. No custodial wallet, no account.

A Model Context Protocol server. Run it over stdio from any MCP client.

## Use it

```bash
npx -y @three-ws/x402-mcp
```

Full usage, tool list and configuration are in [README.md](README.md). Machine-readable summaries: [llms.txt](llms.txt) and [llms-full.txt](llms-full.txt).

## Develop

```bash
npm install
npm test
```

Scripts:
- `npm run start`: `node src/index.js`
- `npm run test`: `node --test "test/**/*.test.mjs"`
- `npm run inspect`: `npx -y @modelcontextprotocol/inspector node src/index.js`

## Conventions

- ES modules, Node >=20.
- Read-only by default. Anything that signs, spends or sends must be an explicit, separately named tool or option, and must never be inferred from untrusted text (token names, memos, listings).
- Never commit credentials. Configuration comes from environment variables documented in the README.
- Keep changes small and covered by a test next to the code they change.

## Source of truth

This repository is a generated mirror of `packages` in https://github.com/nirholas/three.ws. Open issues here; send substantial changes as a pull request here or upstream.
