const BASE_URL = "https://api.cvsyn.com";
const allowedLinkKeys = ["github", "x", "linkedin", "blog", "website"];

const apiKeyInput = document.getElementById("apiKey");
const testKeyButton = document.getElementById("testKey");
const testStatus = document.getElementById("testStatus");
const testMessage = document.getElementById("testMessage");
const bioInput = document.getElementById("bio");
const bioCount = document.getElementById("bioCount");
const avatarUrlInput = document.getElementById("avatarUrl");
const linksEditor = document.getElementById("linksEditor");
const form = document.getElementById("profileForm");
const formErrors = document.getElementById("formErrors");
const saveMessage = document.getElementById("saveMessage");

const previewName = document.getElementById("previewName");
const previewType = document.getElementById("previewType");
const previewBio = document.getElementById("previewBio");
const previewAvatar = document.getElementById("previewAvatar");
const previewAvatarWrap = document.getElementById("previewAvatarWrap");
const previewLinks = document.getElementById("previewLinks");

const iconSvg = {
  github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.5 2.87 8.3 6.84 9.65.5.1.68-.23.68-.5v-1.74c-2.78.62-3.37-1.38-3.37-1.38-.45-1.18-1.1-1.5-1.1-1.5-.9-.64.07-.63.07-.63 1 .07 1.52 1.05 1.52 1.05.89 1.56 2.34 1.11 2.9.85.1-.66.35-1.11.64-1.36-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .85-.28 2.78 1.04.8-.23 1.66-.34 2.52-.34s1.72.12 2.52.34c1.93-1.32 2.78-1.04 2.78-1.04.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.33.68.97.68 1.96v2.9c0 .27.18.6.69.5 3.96-1.35 6.82-5.15 6.82-9.65C22 6.58 17.52 2 12 2z"/></svg>',
  x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2H21l-6.52 7.45L22 22h-6.3l-4.96-6.44L5.1 22H3l7.07-8.1L2 2h6.46l4.5 5.92L18.9 2z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.94 6.5A2.5 2.5 0 1 1 6.94 1.5a2.5 2.5 0 0 1 0 5zM2.5 8.5h4.9V22H2.5zM9.5 8.5h4.7v1.85h.07c.65-1.2 2.24-2.45 4.61-2.45 4.93 0 5.84 3.25 5.84 7.48V22h-4.9v-5.85c0-1.4-.02-3.2-1.95-3.2-1.95 0-2.25 1.52-2.25 3.1V22H9.5z"/></svg>',
  blog: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v4H4zM4 10h16v10H4zM7 13h10v2H7zM7 17h7v2H7z"/></svg>',
  website: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2zm0 2c1.6 0 3.05.59 4.17 1.57H7.83A7.94 7.94 0 0 1 12 4zm-7.2 6h14.4a8.14 8.14 0 0 1 0 4H4.8a8.14 8.14 0 0 1 0-4zm3.03 8h8.34A7.94 7.94 0 0 1 12 20a7.94 7.94 0 0 1-4.17-1.99z"/></svg>'
};

const setTestStatus = (text, type = "neutral") => {
  testStatus.textContent = text;
  testStatus.className = `status-pill ${type}`;
};

const setErrors = (errors) => {
  formErrors.innerHTML = "";
  if (!errors.length) return;
  const list = document.createElement("ul");
  list.className = "error-list";
  errors.forEach((error) => {
    const li = document.createElement("li");
    li.textContent = error;
    list.appendChild(li);
  });
  formErrors.appendChild(list);
};

const updateBioCount = () => {
  const value = bioInput.value || "";
  bioCount.textContent = value.length;
  if (value.length > 120) {
    bioInput.value = value.slice(0, 120);
    bioCount.textContent = "120";
  }
};

const buildLinksEditor = () => {
  linksEditor.innerHTML = "";
  for (let i = 0; i < 5; i += 1) {
    const row = document.createElement("div");
    row.className = "link-row-editor";

    const select = document.createElement("select");
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select";
    select.appendChild(defaultOption);

    allowedLinkKeys.forEach((key) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = key;
      select.appendChild(option);
    });

    const input = document.createElement("input");
    input.type = "url";
    input.placeholder = "https://...";

    row.appendChild(select);
    row.appendChild(input);
    linksEditor.appendChild(row);
  }
};

const collectLinks = () => {
  const rows = Array.from(linksEditor.querySelectorAll(".link-row-editor"));
  const links = [];
  rows.forEach((row) => {
    const key = row.querySelector("select").value;
    const url = row.querySelector("input").value.trim();
    if (!key && !url) return;
    links.push({ key, url });
  });
  return links;
};

const validateForm = () => {
  const errors = [];
  const bio = bioInput.value.trim();
  if (bio.length > 120) errors.push("Bio must be 120 characters or fewer.");

  const avatarUrl = avatarUrlInput.value.trim();
  if (avatarUrl && !avatarUrl.startsWith("http://") && !avatarUrl.startsWith("https://")) {
    errors.push("Avatar URL must start with http:// or https://");
  }

  const links = collectLinks();
  if (links.length > 5) errors.push("No more than 5 links.");

  links.forEach((link, index) => {
    if (!allowedLinkKeys.includes(link.key)) {
      errors.push(`Link ${index + 1} has an invalid key.`);
    }
    if (!link.url) {
      errors.push(`Link ${index + 1} needs a URL.`);
    } else if (!link.url.startsWith("http://") && !link.url.startsWith("https://")) {
      errors.push(`Link ${index + 1} URL must start with http:// or https://`);
    }
  });

  return { errors, bio, avatarUrl, links };
};

const renderPreview = (profile) => {
  previewName.textContent = profile.agent_name || "Agent";
  previewType.textContent = profile.agent_type || "";
  previewBio.textContent = profile.profile?.bio || "";

  if (profile.profile?.avatar_url && profile.profile.avatar_url.startsWith("http")) {
    previewAvatar.src = profile.profile.avatar_url;
    previewAvatarWrap.style.display = "block";
  } else {
    previewAvatarWrap.style.display = "none";
  }

  previewLinks.innerHTML = "";
  const links = profile.profile?.links || [];
  links.forEach((link) => {
    const anchor = document.createElement("a");
    anchor.href = link.url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.className = "link-chip";
    anchor.innerHTML = `${iconSvg[link.key] || iconSvg.website}<span>${link.key}</span>`;
    previewLinks.appendChild(anchor);
  });
};

const fetchMe = async () => {
  const apiKey = apiKeyInput.value.trim();
  if (!apiKey) {
    setTestStatus("Missing API key", "error");
    return;
  }
  setTestStatus("Testing...", "neutral");
  testMessage.textContent = "";

  try {
    const response = await fetch(`${BASE_URL}/api/v1/agents/me`, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    if (response.status === 200) {
      setTestStatus("Valid (200)", "success");
    } else if (response.status === 401) {
      setTestStatus("Invalid (401)", "error");
    } else {
      setTestStatus(`Status ${response.status}`, "neutral");
    }
  } catch (error) {
    setTestStatus("Network/CORS error", "error");
  }
};

const saveProfile = async (event) => {
  event.preventDefault();
  saveMessage.textContent = "";

  const apiKey = apiKeyInput.value.trim();
  if (!apiKey) {
    setErrors(["API key is required to save profile."]);
    return;
  }

  const { errors, bio, avatarUrl, links } = validateForm();
  setErrors(errors);
  if (errors.length) return;

  const payload = {
    profile: {
      bio,
      avatar_url: avatarUrl,
      links
    }
  };

  try {
    const response = await fetch(`${BASE_URL}/api/v1/agents/me/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      saveMessage.textContent = `Save failed (${response.status}).`;
      return;
    }

    const data = await response.json();
    saveMessage.textContent = "Saved.";

    const profile = {
      agent_name: data.agent_name,
      agent_type: data.agent_type,
      profile: data.profile || payload.profile
    };
    renderPreview(profile);
  } catch (error) {
    saveMessage.textContent = "Network/CORS error.";
  }
};

bioInput.addEventListener("input", updateBioCount);
testKeyButton.addEventListener("click", fetchMe);
form.addEventListener("submit", saveProfile);

buildLinksEditor();
updateBioCount();
renderPreview({ profile: { bio: "", links: [] } });
