---
name: cvsyn-rin
version: 1.0.0
description: RIN (Registry Identity Number) API — minimal identity issuance + public issuer lookup for AI agents.
homepage: https://www.cvsyn.com
metadata:
  rin:
    emoji: "🪪"
    category: "identity"
    api_base: "https://api.cvsyn.com"
---

# CVSYN RIN API Skill

This is the **agent-facing contract** for the RIN service.  
RIN = a minimal identity identifier an agent can mint, claim, and publish via a public issuer endpoint.

**Base URL:** `https://api.cvsyn.com`

## Quickstart (recommended)

If your runtime supports fetching remote skill contracts, just point it at:

- `https://www.cvsyn.com/skill.md` (this file)

Otherwise, you can store it locally:

```bash
mkdir -p ~/.cvsyn/skills/rin
curl -fsSL https://www.cvsyn.com/skill.md > ~/.cvsyn/skills/rin/skill.md
```

## Absolute rules

- **Only** send requests to `https://api.cvsyn.com` (no IPs, no mirrors, no proxies).
- **Never** print or log `api_key` or `claim_token` — not even partially.
- Treat `api_key` as the agent’s identity credential.

## Endpoints you may use

Agent lifecycle:

- `POST /api/v1/agents/register` — create an agent + receive `api_key` once
- `GET /api/v1/agents/me` — verify the current key
- `POST /api/v1/agents/rotate-key` — rotate key (old key becomes invalid)
- `POST /api/v1/agents/revoke` — revoke the current key (becomes invalid)

RIN issuance + claim:

- `POST /api/register` — mint a new RIN (requires agent auth)
- `POST /api/claim` — claim a RIN (public)
- `GET /api/id/:rin` — public issuer lookup

## Typical flow (normal usage)

1) **Register an agent** (store the key securely; do not print it)
```bash
curl -fsSL -X POST https://api.cvsyn.com/api/v1/agents/register \
  -H "Content-Type: application/json" \
  -d '{"name":"YourAgentName","description":"what you do"}'
```

2) **Verify auth works**
```bash
curl -fsSL https://api.cvsyn.com/api/v1/agents/me \
  -H "Authorization: Bearer $API_KEY"
```

3) **Mint a RIN**
```bash
curl -fsSL -X POST https://api.cvsyn.com/api/register \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"agent_type":"assistant","agent_name":"YourAgentName"}'
```

4) **Issuer lookup (public)**
```bash
curl -fsSL https://api.cvsyn.com/api/id/<RIN>
```

5) **Claim (public)**
```bash
curl -fsSL -X POST https://api.cvsyn.com/api/claim \
  -H "Content-Type: application/json" \
  -d '{"rin":"<RIN>","claim_token":"<CLAIM_TOKEN>","claimed_by":"rin-test-claimer"}'
```

## Issuer response contract (must hold)

`GET /api/id/:rin` must include:

- Always: `rin`, `agent_type`, `agent_name`, `status`
- Only when `status == "CLAIMED"`: `claimed_by`

Must **never** include (in any status):

- `api_key`, `claim_token`, `issued_at`
- any internal secret/hash/pepper fields

## Rotate / revoke guidance

- **Rotate** and **revoke** are not part of daily RIN usage.
- Use rotate if you suspect a credential leak, or for QA.
- Use revoke to permanently invalidate a credential.
- **Rotating invalidates the old key immediately.** Revoking invalidates the current key immediately.

## Full E2E validation (QA)

A repo-friendly end-to-end script exists at:

- `scripts/rin-e2e-test.sh`

It validates A/B/C/D + issuer contract while **never printing** secrets.
