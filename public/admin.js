const token = localStorage.getItem("lmo_token");
const user = JSON.parse(localStorage.getItem("lmo_user") || "null");
if (!token || !user || user.role !== "admin") window.location.href = "/login.html";

const money = (n) => `${Math.round(n).toLocaleString("fr-FR")} FCFA`;

function renderUsers(users) {
  document.getElementById("usersBody").innerHTML = users.map((u) => `<tr><td>${u.id}</td><td>${u.username}</td><td>${u.email}</td><td>${u.contact}</td><td>${u.role}</td></tr>`).join("");
}

function renderOrders(orders) {
  document.getElementById("ordersBody").innerHTML = orders.map((o) => `<tr><td>${o.orderId}</td><td>${o.customerId}</td><td>${o.customerName}</td><td>${o.contact}</td><td>${o.email}</td><td>${money(o.total)}</td><td>${new Date(o.createdAt).toLocaleString("fr-FR")}</td></tr>`).join("");
}

async function loadOverview() {
  const response = await fetch("/api/admin/overview", { headers: { "x-auth-token": token } });
  if (!response.ok) return (window.location.href = "/login.html");
  const data = await response.json();

  document.getElementById("usersCount").textContent = data.metrics.usersCount;
  document.getElementById("ordersCount").textContent = data.metrics.ordersCount;
  document.getElementById("revenue").textContent = money(data.metrics.revenue);
  document.getElementById("avgBasket").textContent = money(data.metrics.avgBasket);
  document.getElementById("conversionRate").textContent = `${data.metrics.conversionRate.toFixed(1)}%`;
  document.getElementById("topProducts").innerHTML = data.topProducts.length ? data.topProducts.map((p) => `${p.name} (${p.qty})`).join(" • ") : "Aucune commande";

  renderUsers(data.users);
  renderOrders(data.orders);
}

loadOverview();
setInterval(loadOverview, 5000);
