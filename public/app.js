const state = {
  products: [],
  cart: JSON.parse(localStorage.getItem("cart_demo") || "[]"),
  filters: { q: "", category: "all", sort: "featured" }
};

const session = JSON.parse(localStorage.getItem("lmo_user") || "null");

const el = {
  products: document.getElementById("products"),
  stats: document.getElementById("stats"),
  category: document.getElementById("category"),
  sort: document.getElementById("sort"),
  search: document.getElementById("search"),
  cartItems: document.getElementById("cartItems"),
  cartTotal: document.getElementById("cartTotal"),
  form: document.getElementById("checkoutForm"),
  feedback: document.getElementById("feedback"),
  sessionLabel: document.getElementById("sessionLabel")
};

if (session && el.sessionLabel) el.sessionLabel.textContent = `${session.username} (${session.id})`;

const money = (n) => `${Math.round(n).toLocaleString("fr-FR")} FCFA`;
const persistCart = () => localStorage.setItem("cart_demo", JSON.stringify(state.cart));
const getTotal = () => state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);

function renderCart() {
  el.cartItems.innerHTML = state.cart.length ? state.cart.map((item) => `
    <article class="cart-item">
      <div class="row"><strong>${item.name}</strong><button class="btn-soft" data-remove="${item.id}">Retirer</button></div>
      <div class="row"><span>${money(item.price)}</span><span>x${item.qty}</span></div>
    </article>
  `).join("") : '<div class="muted">Votre panier est vide.</div>';

  el.cartTotal.textContent = money(getTotal());
  document.querySelectorAll("[data-remove]").forEach((btn) => btn.onclick = () => {
    state.cart = state.cart.filter((item) => item.id !== btn.dataset.remove);
    persistCart();
    renderCart();
  });
}

function renderProducts(list) {
  el.stats.textContent = `${list.length} produit(s) disponible(s)`;
  el.products.innerHTML = list.map((product) => `
    <article class="product-card">
      <img src="${product.image}" alt="${product.name}" loading="lazy" />
      <div class="product-body">
        <span class="badge">${product.badge}</span>
        <strong>${product.name}</strong>
        <div class="meta"><span>${product.category}</span><span>Note ${product.rating}</span></div>
        <p class="muted">${product.description}</p>
        <div class="row">
          <span class="price">${money(product.price)}</span>
          <button class="btn-primary" data-add="${product.id}">Ajouter</button>
        </div>
      </div>
    </article>
  `).join("");

  document.querySelectorAll("[data-add]").forEach((btn) => btn.onclick = () => {
    const found = list.find((item) => item.id === btn.dataset.add);
    if (!found) return;
    const existing = state.cart.find((item) => item.id === found.id);
    if (existing) existing.qty += 1;
    else state.cart.push({ id: found.id, name: found.name, price: found.price, qty: 1 });
    persistCart();
    renderCart();
  });
}

async function fetchProducts() {
  const params = new URLSearchParams(state.filters);
  const response = await fetch(`/api/products?${params}`);
  const data = await response.json();
  if (!el.category.options.length) {
    el.category.innerHTML = data.categories.map((category) => `<option value="${category}">${category === "all" ? "Toutes categories" : category}</option>`).join("");
  }
  state.products = data.products;
  renderProducts(data.products);
}

el.search.addEventListener("input", (event) => { state.filters.q = event.target.value.trim(); fetchProducts(); });
el.category.addEventListener("change", (event) => { state.filters.category = event.target.value; fetchProducts(); });
el.sort.addEventListener("change", (event) => { state.filters.sort = event.target.value; fetchProducts(); });

el.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!state.cart.length) {
    el.feedback.innerHTML = '<div class="notice err">Ajoutez au moins un produit avant validation.</div>';
    return;
  }

  const formData = new FormData(el.form);
  const payload = {
    customer: {
      customerId: session?.id,
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      contact: formData.get("contact"),
      address: formData.get("address")
    },
    items: state.cart,
    total: getTotal()
  };

  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await response.json();

  if (!response.ok) {
    el.feedback.innerHTML = `<div class="notice err">${data.error || "Erreur de validation."}</div>`;
    return;
  }

  state.cart = [];
  persistCart();
  renderCart();
  el.form.reset();
  el.feedback.innerHTML = `<div class="notice ok">${data.message}<br>Reference: ${data.orderId}</div>`;
});

fetchProducts();
renderCart();
