document.addEventListener("DOMContentLoaded", () => {
  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
  initGoogleAuth();
});

async function initGoogleAuth() {
  const signInBox = document.getElementById("googleSignIn");
  const userMenu = document.getElementById("userMenu");
  const userAvatar = document.getElementById("userAvatar");
  const userName = document.getElementById("userName");
  const logoutButton = document.getElementById("logoutButton");
  if (!signInBox || !userMenu || !logoutButton) return;

  const me = await fetchCurrentUser();
  if (me && me.user) {
    renderUser(me.user);
  } else {
    renderGoogleButton();
  }

  logoutButton.addEventListener("click", async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    userMenu.hidden = true;
    renderGoogleButton();
  });

  function renderUser(user) {
    signInBox.innerHTML = "";
    userMenu.hidden = false;
    if (userAvatar) {
      userAvatar.src = user.picture || "";
      userAvatar.hidden = !user.picture;
    }
    if (userName) userName.textContent = user.name || user.email || "Account";
  }

  function renderGoogleButton() {
    userMenu.hidden = true;
    const clientId = window.IMAGE_COLOR_AI_GOOGLE_CLIENT_ID || "";
    if (!clientId || !window.google || !window.google.accounts) {
      signInBox.innerHTML = '<a class="button" href="mailto:privacy@imagecolorai.com">Sign in soon</a>';
      return;
    }
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse
    });
    window.google.accounts.id.renderButton(signInBox, {
      theme: "outline",
      size: "medium",
      shape: "pill",
      text: "signin_with"
    });
  }

  async function handleCredentialResponse(response) {
    if (!response || !response.credential) return;
    const res = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential: response.credential })
    }).catch(() => null);
    if (!res || !res.ok) return;
    const data = await res.json().catch(() => null);
    if (data && data.user) renderUser(data.user);
  }
}

async function fetchCurrentUser() {
  const res = await fetch("/api/auth/me").catch(() => null);
  if (!res || !res.ok) return null;
  return res.json().catch(() => null);
}
