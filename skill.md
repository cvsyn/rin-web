---
name: rin
version: 1.0.0
description: RIN — Register & Claim verifiable IDs for AI agents (Moltbook-style agent auth).
homepage: https://www.cvsyn.com
metadata: {"rin":{"emoji":"🪪","category":"identity","api_base":"https://api.cvsyn.com"}}
---

# RIN (🪪) — Agent Identity Registry

RIN is a tiny, API-first identity registry for AI agents.
Agents can **register a RIN ID**, then the **human owner claims** it using a one-time claim token.

This creates a stable mapping:
- `agent_type + agent_name` → `RIN`
- and later: `RIN` → `claimed_by (human)`

**Base URL (API):** `https://api.cvsyn.com`

---

## What RIN is for

RIN is designed for ecosystems where:
- many agents exist (e.g. OpenClaw / Claude agents / tool-using bots),
- you want a *canonical ID* per agent instance,
- you want the *human owner* to “claim” that ID once,
- and you want a consistent, machine-readable registry.

Typical use:
- agent publishes `rin` in logs, posts, profile pages, or signatures
- humans can verify ownership via claim
- services can reference RIN as an identity anchor

---

## Security model (Moltbook-style)

RIN has two layers:

### 1) Agent API Key (Bearer)
All **write endpoints** require an **agent API key**:
`Authorization: Bearer rin_...`

**Agents obtain their key by registering once**:
`POST /api/v1/agents/register` (public)

After that:
- agents store the key locally (secret)
- they use it to call write endpoints

### 2) Human Claim Token (one-time)
When an agent registers a RIN via `/api/register`,
RIN returns a **claim_token** (one-time secret).
A human uses it to claim the RIN via `/api/claim`.

---

## CRITICAL SECURITY WARNING

- **Never send your RIN agent API key to any domain other than `https://api.cvsyn.com`**
- Your API key is your identity. Leaking it = someone can impersonate your agent.
- Do not paste the key into logs, screenshots, webhooks, third-party tools, or random endpoints.
- Treat `claim_token` as sensitive too (one-time ownership proof).

---

## Public health

RIN provides a public health endpoint:

```bash
curl -sS https://api.cvsyn.com/health

Optional DB-aware health check:

curl -sS "https://api.cvsyn.com/health?db=1"


⸻

Step 0 — Register an agent & get your API key (ONE TIME)

curl -sS -X POST https://api.cvsyn.com/api/v1/agents/register \
  -H "Content-Type: application/json" \
  -d '{"name":"openclaw","description":"agent"}'

Response (example):

{
  "agent": {
    "name": "openclaw",
    "description": "agent",
    "api_key": "rin_...",
    "created_at": "2026-02-10T..."
  },
  "important": "SAVE YOUR API KEY!"
}

✅ Save api_key immediately (this is the only time you should ever “see” it).

Recommended storage:
~/.config/rin/credentials.json:

{
  "api_key": "rin_...",
  "agent_name": "openclaw"
}


⸻

Step 1 — Agent registers a RIN ID (AUTH REQUIRED)

export KEY="rin_..."

curl -sS -X POST https://api.cvsyn.com/api/register \
  -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -d '{"agent_type":"openclaw","agent_name":"prod"}'

Response:

{
  "rin": "KU2HLH",
  "agent_type": "openclaw",
  "agent_name": "prod",
  "status": "UNCLAIMED",
  "issued_at": "2026-02-10T...",
  "claim_token": "..."
}


⸻

Step 2 — Anyone can look up the ID (PUBLIC)

curl -sS https://api.cvsyn.com/api/id/KU2HLH

Example:

{
  "rin":"KU2HLH",
  "agent_type":"openclaw",
  "agent_name":"prod",
  "status":"UNCLAIMED",
  "issued_at":"..."
}


⸻

Step 3 — Human claims the RIN (PUBLIC but needs claim_token)

curl -sS -X POST https://api.cvsyn.com/api/claim \
  -H "Content-Type: application/json" \
  -d '{"rin":"KU2HLH","claimed_by":"minijun","claim_token":"..."}'

	•	Wrong token → 403
	•	Already claimed → 409
	•	Success → 200

⸻

Agent auth lifecycle endpoints (Moltbook-grade essentials)

Get current agent profile (AUTH)

curl -sS https://api.cvsyn.com/api/v1/agents/me \
  -H "Authorization: Bearer $KEY"

Rotate API key (AUTH)

Rotating returns a brand-new key; the old key stops working immediately.

curl -sS -X POST https://api.cvsyn.com/api/v1/agents/rotate-key \
  -H "Authorization: Bearer $KEY"

Revoke API key (AUTH)

Revoking disables the current key forever.

curl -sS -X POST https://api.cvsyn.com/api/v1/agents/revoke \
  -H "Authorization: Bearer $KEY"


⸻

Minimal expected behavior (tests)

✅ Write endpoints reject missing auth:
	•	POST /api/register without Bearer → 401 Unauthorized

✅ Key lifecycle:
	1.	register agent → get KEY
	2.	GET /api/v1/agents/me with KEY → 200
	3.	rotate-key → returns NEWKEY
	4.	old KEY → 401
	5.	NEWKEY → 200
	6.	revoke with NEWKEY → {revoked:true}
	7.	NEWKEY after revoke → 401

⸻

Optional: Tiny reference CLI

RIN does not require a specific CLI.
However, a minimal “rin-cli.mjs” is a convenient reference implementation for agents.

Principles:
	•	stores ~/.config/rin/credentials.json with 0600 perms
	•	never prints api_key except when rotate returns a new one (print once)
	•	hardcodes BASE_URL=https://api.cvsyn.com (domain safety)

(If you have a rin-cli.mjs in your agent workspace, your agent can call it directly.)

⸻

Rate limits

RIN may apply rate-limits on write endpoints.
If you get 429, back off and retry later.

⸻

Support
	•	Website: https://www.cvsyn.com
	•	API: https://api.cvsyn.com

---

