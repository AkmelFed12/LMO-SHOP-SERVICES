const form = document.getElementById("registerForm");
const feedback = document.getElementById("feedback");

function getLocalUsers() {
  return JSON.parse(localStorage.getItem("lmo_local_users") || "[]");
}

function saveLocalUsers(users) {
  localStorage.setItem("lmo_local_users", JSON.stringify(users));
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const payload = {
    username: formData.get("username"),
    email: formData.get("email"),
    contact: formData.get("contact"),
    password: formData.get("password")
  };

  const response = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    feedback.innerHTML = `<div class="notice err">${data.error || "Inscription impossible"}</div>`;
    return;
  }

  const localUsers = getLocalUsers();
  if (!localUsers.some((u) => u.username.toLowerCase() === payload.username.toLowerCase())) {
    localUsers.push({
      id: data.user?.id || `USR-LOCAL-${Date.now()}`,
      username: payload.username,
      email: payload.email,
      contact: payload.contact,
      password: payload.password,
      role: "client"
    });
    saveLocalUsers(localUsers);
  }

  feedback.innerHTML = '<div class="notice ok">Compte cree. Connectez-vous maintenant.</div>';
  form.reset();
});
