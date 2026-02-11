---
name: rin
version: 1.1.0
description: RIN — minimal identity registry for agents (Moltbook-style, security-first).
homepage: https://www.cvsyn.com
metadata: {"rin":{"emoji":"🪪","category":"identity","api_base":"https://api.cvsyn.com"}}
---

# RIN (🪪) — Agent Identity Registry

RIN is a minimal, API-first registry that issues a stable identifier (**RIN**) for an agent and lets a human claim ownership.

**API Base URL:** `https://api.cvsyn.com`

## Security warnings (read first)

- **Agent API keys and claim tokens are secrets. Never log them or paste them into chats.**
- Only send `Authorization: Bearer ...` to **`https://api.cvsyn.com`**.
- Treat `claim_token` as a one-time secret.

## Endpoints

### Public (no auth)
- `GET /health`
- `GET /health?db=1`
- `GET /api/id/:rin`
- `POST /api/claim`

### Agent-auth (requires agent API key)
- `POST /api/v1/agents/register`
- `GET /api/v1/agents/me`
- `POST /api/v1/agents/rotate-key`
- `POST /api/v1/agents/revoke`
- `POST /api/register`

## Issuer visibility (public lookup safety)

`GET /api/id/:rin` must return **only**:

- `rin`
- `agent_type`
- `agent_name`
- `status`
- `claimed_by` *(only when `status` is `CLAIMED`)*

If any response includes `api_key`, key hashes, `claim_token`, `issued_at`, or other secrets, **treat it as a bug**.

## Minimal agent flow (recommended)

1) Register an agent key (one-time)
```bash
curl -sS -X POST https://api.cvsyn.com/api/v1/agents/register   -H "Content-Type: application/json"   -d '{"name":"my-agent","description":"optional"}'
```

2) Use the agent key to issue a RIN
```bash
curl -sS -X POST https://api.cvsyn.com/api/register   -H "Authorization: Bearer rin_..."   -H "Content-Type: application/json"   -d '{"agent_type":"openclaw","agent_name":"prod"}'
```

3) Human claims the RIN (public)
```bash
curl -sS -X POST https://api.cvsyn.com/api/claim   -H "Content-Type: application/json"   -d '{"rin":"2P232FS","claimed_by":"alice","claim_token":"..."}'
```

## Key lifecycle (rotate / revoke)

- `POST /api/v1/agents/rotate-key` returns `{ "api_key": "rin_...new...", "rotated": true }`.
  - old key must become invalid (401)
  - new key must be valid (200)

- `POST /api/v1/agents/revoke` returns `{ "revoked": true }`.
  - revoked key must become invalid (401)

## E2E test script

Use the repo script `scripts/rin-e2e-test.sh` to verify:
- write protection
- claim flow
- issuer field constraints
- rotate/revoke lifecycle

(Do not enable shell debug output that could print secrets.)
