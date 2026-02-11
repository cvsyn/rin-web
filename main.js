const toast = document.getElementById("toast");
let toastTimer;

const showToast = (message) => {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
};

document.addEventListener("click", async (event) => {
  const button = event.target.closest(".copy-btn");
  if (!button) return;

  const targetId = button.getAttribute("data-copy-target");
  const target = document.getElementById(targetId);
  if (!target) return;

  try {
    await navigator.clipboard.writeText(target.innerText.trim());
    showToast("Copied to clipboard");
  } catch (error) {
    showToast("Copy failed - select text");
  }
});

(() => {
  const path = window.location.pathname;
  if (path.startsWith("/id/")) {
    const parts = path.split("/").filter(Boolean);
    if (parts.length >= 2 && parts[1]) {
      const rin = parts[1];
      const target = `/id/?rin=${encodeURIComponent(rin)}`;
      window.location.replace(target);
      return;
    }
  }
  if (path === "/settings") {
    window.location.replace("/settings/");
  }
})();
