const state = {
  products: [],
  cart: JSON.parse(localStorage.getItem("cart_demo") || "[]"),
  filters: { q: "", category: "all", sort: "featured", brand: "all", minPrice: "0", maxPrice: "999999999" }
};
const session = JSON.parse(localStorage.getItem("lmo_user") || "null");

const el = {
  products: document.getElementById("products"), stats: document.getElementById("stats"), category: document.getElementById("category"), brand: document.getElementById("brand"),
  sort: document.getElementById("sort"), search: document.getElementById("search"), minPrice: document.getElementById("minPrice"), maxPrice: document.getElementById("maxPrice"),
  cartItems: document.getElementById("cartItems"), cartTotal: document.getElementById("cartTotal"), form: document.getElementById("checkoutForm"), feedback: document.getElementById("feedback"),
  sessionLabel: document.getElementById("sessionLabel"), modal: document.getElementById("productModal"), closeModal: document.getElementById("closeModal"), modalImage: document.getElementById("modalImage"),
  modalName: document.getElementById("modalName"), modalPrice: document.getElementById("modalPrice"), modalSpecs: document.getElementById("modalSpecs")
};
if (session && el.sessionLabel) el.sessionLabel.textContent = `${session.username} (${session.id})`;

const money = (n) => `${Math.round(n).toLocaleString("fr-FR")} FCFA`;
const persistCart = () => localStorage.setItem("cart_demo", JSON.stringify(state.cart));
const getTotal = () => state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);

async function track(type, payload = {}) {
  try { await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, payload }) }); } catch {}
}

function openProductModal(product) {
  el.modalImage.src = product.image;
  el.modalImage.alt = product.name;
  el.modalName.textContent = product.name;
  el.modalPrice.textContent = money(product.price);
  el.modalSpecs.innerHTML = Object.entries(product.specs || {}).map(([k, v]) => `<div class="spec-row"><strong>${k}</strong><span>${v}</span></div>`).join("");
  el.modal.hidden = false;
}

function closeProductModal() { el.modal.hidden = true; }

function renderCart() {
  el.cartItems.innerHTML = state.cart.length ? state.cart.map((item) => `<article class="cart-item"><div class="row"><strong>${item.name}</strong><button class="btn-soft" data-remove="${item.id}">Retirer</button></div><div class="row"><span>${money(item.price)}</span><span>x${item.qty}</span></div></article>`).join("") : '<div class="muted">Votre panier est vide.</div>';
  el.cartTotal.textContent = money(getTotal());
  document.querySelectorAll("[data-remove]").forEach((btn) => btn.onclick = () => { state.cart = state.cart.filter((item) => item.id !== btn.dataset.remove); persistCart(); renderCart(); });
}

function renderProducts(list) {
  el.stats.textContent = `${list.length} produit(s) disponible(s)`;
  el.products.innerHTML = list.map((product) => `<article class="product-card"><button class="image-btn" data-open="${product.id}" type="button"><img src="${product.image}" alt="${product.name}" loading="lazy" /></button><div class="product-body"><span class="badge">${product.badge}</span><strong>${product.name}</strong><div class="meta"><span>${product.category}</span><span>Note ${product.rating}</span></div><p class="muted">${product.description}</p><div class="row"><span class="price">${money(product.price)}</span><button class="btn-primary" data-add="${product.id}">Ajouter</button></div><div class="row"><a href="/product.html?id=${encodeURIComponent(product.id)}">Voir fiche</a><a href="https://wa.me/2250700000000?text=${encodeURIComponent("Bonjour, je veux " + product.name)}" target="_blank" rel="noopener noreferrer">WhatsApp</a></div></div></article>`).join("");

  document.querySelectorAll("[data-add]").forEach((btn) => btn.onclick = async () => {
    const found = list.find((item) => item.id === btn.dataset.add);
    if (!found) return;
    const existing = state.cart.find((item) => item.id === found.id);
    if (existing) existing.qty += 1; else state.cart.push({ id: found.id, name: found.name, price: found.price, qty: 1 });
    persistCart(); renderCart();
    await track("cart_add", { productId: found.id, productName: found.name });
  });

  document.querySelectorAll("[data-open]").forEach((btn) => btn.onclick = () => {
    const product = list.find((item) => item.id === btn.dataset.open);
    if (product) openProductModal(product);
  });
}

async function fetchProducts() {
  const params = new URLSearchParams(state.filters);
  const response = await fetch(`/api/products?${params}`);
  const data = await response.json();

  if (!el.category.options.length) el.category.innerHTML = data.categories.map((c) => `<option value="${c}">${c === "all" ? "Toutes categories" : c}</option>`).join("");
  if (!el.brand.options.length) el.brand.innerHTML = data.brands.map((b) => `<option value="${b}">${b === "all" ? "Toutes marques" : b}</option>`).join("");

  state.products = data.products;
  renderProducts(data.products);
}

el.search.addEventListener("input", (e) => { state.filters.q = e.target.value.trim(); fetchProducts(); });
el.category.addEventListener("change", (e) => { state.filters.category = e.target.value; fetchProducts(); });
el.brand.addEventListener("change", (e) => { state.filters.brand = e.target.value; fetchProducts(); });
el.sort.addEventListener("change", (e) => { state.filters.sort = e.target.value; fetchProducts(); });
el.minPrice.addEventListener("change", (e) => { state.filters.minPrice = e.target.value || "0"; fetchProducts(); });
el.maxPrice.addEventListener("change", (e) => { state.filters.maxPrice = e.target.value || "999999999"; fetchProducts(); });

el.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!state.cart.length) {
    el.feedback.innerHTML = '<div class="notice err">Ajoutez au moins un produit avant validation.</div>';
    return;
  }

  const formData = new FormData(el.form);
  const payload = { customer: { customerId: session?.id, fullName: formData.get("fullName"), email: formData.get("email"), contact: formData.get("contact"), address: formData.get("address") }, items: state.cart, total: getTotal(), payment: { method: "Paiement a la livraison", status: "en_attente" } };

  const response = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const data = await response.json();

  if (!response.ok) {
    el.feedback.innerHTML = `<div class="notice err">${data.error || "Erreur de validation."}</div>`;
    return;
  }

  await track("checkout_success", { orderId: data.orderId, total: payload.total });
  state.cart = []; persistCart(); renderCart(); el.form.reset();
  el.feedback.innerHTML = `<div class="notice ok">${data.message}<br>Reference: ${data.orderId}</div>`;
});

el.closeModal?.addEventListener("click", closeProductModal);
el.modal?.addEventListener("click", (e) => { if (e.target === el.modal) closeProductModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && el.modal && !el.modal.hidden) closeProductModal(); });

fetchProducts();
renderCart();
