const form = document.getElementById("registerForm");
const feedback = document.getElementById("feedback");

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

  feedback.innerHTML = '<div class="notice ok">Compte cree. Connectez-vous maintenant.</div>';
  form.reset();
});
