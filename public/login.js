const form = document.getElementById("loginForm");
const feedback = document.getElementById("feedback");

function getLocalUsers() {
  return JSON.parse(localStorage.getItem("lmo_local_users") || "[]");
}

function loginWithLocalUser(username, password) {
  const user = getLocalUsers().find(
    (u) => u.username.toLowerCase() === String(username).toLowerCase() && u.password === password
  );
  if (!user) return false;

  const sessionUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    contact: user.contact,
    role: user.role || "client"
  };

  localStorage.setItem("lmo_token", `local-${Date.now()}`);
  localStorage.setItem("lmo_user", JSON.stringify(sessionUser));
  window.location.href = "/";
  return true;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const payload = { username: formData.get("username"), password: formData.get("password") };

  const response = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    const ok = loginWithLocalUser(payload.username, payload.password);
    if (!ok) {
      feedback.innerHTML = `<div class="notice err">${data.error || "Connexion impossible"}</div>`;
    }
    return;
  }

  localStorage.setItem("lmo_token", data.token);
  localStorage.setItem("lmo_user", JSON.stringify(data.user));
  window.location.href = data.user.role === "admin" ? "/admin.html" : "/";
});
