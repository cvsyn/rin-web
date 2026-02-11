const BASE_URL = "https://api.cvsyn.com";
const forbiddenFields = new Set(["api_key", "claim_token", "agent_api_key_hash", "apiKey", "claimToken"]);

const statusMessage = document.getElementById("statusMessage");
const card = document.getElementById("card");
const loadBtn = document.getElementById("loadBtn");
const rinInput = document.getElementById("rinInput");

const agentName = document.getElementById("agentName");
const agentType = document.getElementById("agentType");
const badge = document.getElementById("badge");
const avatar = document.getElementById("avatar");
const avatarWrap = document.getElementById("avatarWrap");
const bio = document.getElementById("bio");
const status = document.getElementById("status");
const rinValue = document.getElementById("rin");
const claimedWrap = document.getElementById("claimedWrap");
const claimedBy = document.getElementById("claimedBy");
const links = document.getElementById("links");

const iconSvg = {
  github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.5 2.87 8.3 6.84 9.65.5.1.68-.23.68-.5v-1.74c-2.78.62-3.37-1.38-3.37-1.38-.45-1.18-1.1-1.5-1.1-1.5-.9-.64.07-.63.07-.63 1 .07 1.52 1.05 1.52 1.05.89 1.56 2.34 1.11 2.9.85.1-.66.35-1.11.64-1.36-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .85-.28 2.78 1.04.8-.23 1.66-.34 2.52-.34s1.72.12 2.52.34c1.93-1.32 2.78-1.04 2.78-1.04.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.33.68.97.68 1.96v2.9c0 .27.18.6.69.5 3.96-1.35 6.82-5.15 6.82-9.65C22 6.58 17.52 2 12 2z"/></svg>',
  x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2H21l-6.52 7.45L22 22h-6.3l-4.96-6.44L5.1 22H3l7.07-8.1L2 2h6.46l4.5 5.92L18.9 2z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.94 6.5A2.5 2.5 0 1 1 6.94 1.5a2.5 2.5 0 0 1 0 5zM2.5 8.5h4.9V22H2.5zM9.5 8.5h4.7v1.85h.07c.65-1.2 2.24-2.45 4.61-2.45 4.93 0 5.84 3.25 5.84 7.48V22h-4.9v-5.85c0-1.4-.02-3.2-1.95-3.2-1.95 0-2.25 1.52-2.25 3.1V22H9.5z"/></svg>',
  blog: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v4H4zM4 10h16v10H4zM7 13h10v2H7zM7 17h7v2H7z"/></svg>',
  website: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2zm0 2c1.6 0 3.05.59 4.17 1.57H7.83A7.94 7.94 0 0 1 12 4zm-7.2 6h14.4a8.14 8.14 0 0 1 0 4H4.8a8.14 8.14 0 0 1 0-4zm3.03 8h8.34A7.94 7.94 0 0 1 12 20a7.94 7.94 0 0 1-4.17-1.99z"/></svg>'
};

const sanitize = (data) => {
  if (!data || typeof data !== "object") return null;
  const safe = {};
  Object.keys(data).forEach((key) => {
    if (forbiddenFields.has(key)) return;
    if (
      key === "rin" ||
      key === "agent_type" ||
      key === "agent_name" ||
      key === "status" ||
      key === "issued_at" ||
      key === "claimed_by" ||
      key === "claimed_at"
    ) {
      safe[key] = data[key];
    }
    if (key === "profile" && data.profile && typeof data.profile === "object") {
      safe.profile = {};
      const profile = data.profile;
      if (typeof profile.bio === "string") safe.profile.bio = profile.bio;
      if (typeof profile.avatar_url === "string") safe.profile.avatar_url = profile.avatar_url;
      if (profile.links) safe.profile.links = profile.links;
    }
  });
  return safe;
};

const normalizeLinks = (linksValue) => {
  const allowed = ["github", "x", "linkedin", "blog", "website"];
  const normalized = [];

  if (Array.isArray(linksValue)) {
    linksValue.forEach((item) => {
      if (!item || typeof item !== "object") return;
      const key = item.key || item.type || item.name;
      const url = item.url || item.href || item.link;
      if (allowed.includes(key) && typeof url === "string") {
        normalized.push({ key, url });
      }
    });
  } else if (linksValue && typeof linksValue === "object") {
    Object.entries(linksValue).forEach(([key, url]) => {
      if (allowed.includes(key) && typeof url === "string") {
        normalized.push({ key, url });
      }
    });
  }

  return normalized.slice(0, 5);
};

const setMessage = (text, type = "info") => {
  statusMessage.textContent = text;
  statusMessage.className = `status-message ${type}`;
};

const renderLinks = (linkItems) => {
  links.innerHTML = "";
  if (!linkItems.length) return;
  linkItems.forEach((link) => {
    const anchor = document.createElement("a");
    anchor.href = link.url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.className = "link-chip";
    anchor.innerHTML = `${iconSvg[link.key] || iconSvg.website}<span>${link.key}</span>`;
    links.appendChild(anchor);
  });
};

const renderCard = (data) => {
  const safe = sanitize(data);
  if (!safe) return;

  card.classList.remove("hidden");
  agentName.textContent = safe.agent_name || "Unknown Agent";
  agentType.textContent = safe.agent_type || "";
  status.textContent = safe.status || "";
  rinValue.textContent = safe.rin || "";

  const isClaimed = String(safe.status || "").toUpperCase() === "CLAIMED";
  badge.classList.toggle("hidden", !isClaimed);

  if (safe.claimed_by) {
    claimedWrap.style.display = "block";
    claimedBy.textContent = safe.claimed_by;
  } else {
    claimedWrap.style.display = "none";
  }

  const profile = safe.profile || {};
  const bioText = typeof profile.bio === "string" ? profile.bio.slice(0, 120) : "";
  bio.textContent = bioText;

  if (profile.avatar_url && profile.avatar_url.startsWith("http")) {
    avatar.src = profile.avatar_url;
    avatarWrap.style.display = "block";
  } else {
    avatarWrap.style.display = "none";
  }

  renderLinks(normalizeLinks(profile.links));
};

const fetchCard = async (rin) => {
  if (!rin) return;
  setMessage("Loading...", "info");
  card.classList.add("hidden");

  try {
    const response = await fetch(`${BASE_URL}/api/id/${encodeURIComponent(rin)}`);
    if (!response.ok) {
      setMessage(`Lookup failed: ${response.status}`, "error");
      return;
    }
    const data = await response.json();
    setMessage("Loaded", "success");
    renderCard(data);
  } catch (error) {
    setMessage("Network or CORS error. Please try again.", "error");
  }
};

const readRinFromPath = () => {
  const path = window.location.pathname.split("/").filter(Boolean);
  const idIndex = path.indexOf("id");
  if (idIndex !== -1 && path[idIndex + 1]) return path[idIndex + 1];
  const param = new URLSearchParams(window.location.search).get("rin");
  return param || "";
};

loadBtn.addEventListener("click", () => {
  const rin = rinInput.value.trim();
  fetchCard(rin);
});

rinInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    fetchCard(rinInput.value.trim());
  }
});

const initialRin = readRinFromPath();
if (initialRin) {
  rinInput.value = initialRin;
  fetchCard(initialRin);
}
