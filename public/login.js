const form = document.getElementById("loginForm");
const feedback = document.getElementById("feedback");

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
    feedback.innerHTML = `<div class="notice err">${data.error || "Connexion impossible"}</div>`;
    return;
  }

  localStorage.setItem("lmo_token", data.token);
  localStorage.setItem("lmo_user", JSON.stringify(data.user));
  window.location.href = data.user.role === "admin" ? "/admin.html" : "/";
});
