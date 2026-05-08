const token = localStorage.getItem("lmo_token");
const user = JSON.parse(localStorage.getItem("lmo_user") || "null");

if (!token || !user || user.role !== "admin") {
  window.location.href = "/login.html";
}

const usersCount = document.getElementById("usersCount");
const ordersCount = document.getElementById("ordersCount");
const revenue = document.getElementById("revenue");
const usersBody = document.getElementById("usersBody");
const ordersBody = document.getElementById("ordersBody");

const money = (n) => `${Math.round(n).toLocaleString("fr-FR")} FCFA`;

function renderUsers(users) {
  usersBody.innerHTML = users.map((u) => `
    <tr>
      <td>${u.id}</td>
      <td>${u.username}</td>
      <td>${u.email}</td>
      <td>${u.contact}</td>
      <td>${u.role}</td>
    </tr>
  `).join("");
}

function renderOrders(orders) {
  ordersBody.innerHTML = orders.map((o) => `
    <tr>
      <td>${o.orderId}</td>
      <td>${o.customerId}</td>
      <td>${o.customerName}</td>
      <td>${o.contact}</td>
      <td>${o.email}</td>
      <td>${money(o.total)}</td>
      <td>${new Date(o.createdAt).toLocaleString("fr-FR")}</td>
    </tr>
  `).join("");
}

async function loadOverview() {
  const response = await fetch("/api/admin/overview", { headers: { "x-auth-token": token } });
  if (!response.ok) {
    window.location.href = "/login.html";
    return;
  }

  const data = await response.json();
  usersCount.textContent = data.metrics.usersCount;
  ordersCount.textContent = data.metrics.ordersCount;
  revenue.textContent = money(data.metrics.revenue);
  renderUsers(data.users);
  renderOrders(data.orders);
}

loadOverview();
setInterval(loadOverview, 5000);
