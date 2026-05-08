const state = {
  products: [],
  cart: JSON.parse(localStorage.getItem("cart_demo") || "[]"),
  filters: { q: "", category: "all", sort: "featured" }
};

const el = {
  products: document.getElementById("products"),
  stats: document.getElementById("stats"),
  category: document.getElementById("category"),
  sort: document.getElementById("sort"),
  search: document.getElementById("search"),
  cartItems: document.getElementById("cartItems"),
  cartTotal: document.getElementById("cartTotal"),
  form: document.getElementById("checkoutForm"),
  feedback: document.getElementById("feedback")
};

const money = (n) => `${n.toFixed(2)} EUR`;

function persistCart() {
  localStorage.setItem("cart_demo", JSON.stringify(state.cart));
}

function getTotal() {
  return state.cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

function renderCart() {
  if (!state.cart.length) {
    el.cartItems.innerHTML = '<div class="muted">Ton panier est vide.</div>';
  } else {
    el.cartItems.innerHTML = state.cart.map(item => `
      <div class="cart-item">
        <div class="row"><strong>${item.name}</strong><button class="btn-soft" data-remove="${item.id}">Retirer</button></div>
        <div class="row"><span>${money(item.price)}</span><span>x${item.qty}</span></div>
      </div>
    `).join("");
  }
  el.cartTotal.textContent = money(getTotal());

  document.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.onclick = () => {
      const id = btn.dataset.remove;
      state.cart = state.cart.filter(i => i.id !== id);
      persistCart();
      renderCart();
    };
  });
}

function addToCart(product) {
  const existing = state.cart.find(i => i.id === product.id);
  if (existing) existing.qty += 1;
  else state.cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
  persistCart();
  renderCart();
}

function renderProducts(list) {
  el.stats.textContent = `${list.length} produit(s) affiche(s)`;
  el.products.innerHTML = list.map(p => `
    <article class="card">
      <img src="${p.image}" alt="${p.name}" loading="lazy" />
      <div class="card-body">
        <span class="badge">${p.badge}</span>
        <strong>${p.name}</strong>
        <span class="muted">${p.category} • Note ${p.rating}</span>
        <span class="muted">${p.description}</span>
        <div class="row">
          <span class="price">${money(p.price)}</span>
          <button class="btn-main" data-add="${p.id}">Ajouter</button>
        </div>
      </div>
    </article>
  `).join("");

  document.querySelectorAll("[data-add]").forEach((btn) => {
    btn.onclick = () => {
      const p = list.find(x => x.id === btn.dataset.add);
      if (p) addToCart(p);
    };
  });
}

async function fetchProducts() {
  const params = new URLSearchParams(state.filters);
  const res = await fetch(`/api/products?${params.toString()}`);
  const data = await res.json();

  if (!el.category.options.length) {
    el.category.innerHTML = data.categories.map(c =>
      `<option value="${c}">${c === "all" ? "Toutes categories" : c}</option>`
    ).join("");
  }

  state.products = data.products;
  renderProducts(data.products);
}

function wireFilters() {
  el.search.addEventListener("input", (e) => {
    state.filters.q = e.target.value.trim();
    fetchProducts();
  });

  el.category.addEventListener("change", (e) => {
    state.filters.category = e.target.value;
    fetchProducts();
  });

  el.sort.addEventListener("change", (e) => {
    state.filters.sort = e.target.value;
    fetchProducts();
  });
}

el.form.addEventListener("submit", async (e) => {
  e.preventDefault();
  el.feedback.innerHTML = "";
  if (!state.cart.length) {
    el.feedback.innerHTML = '<div class="notice err">Ajoute au moins un produit.</div>';
    return;
  }

  const fd = new FormData(el.form);
  const payload = {
    customer: {
      fullName: fd.get("fullName"),
      email: fd.get("email"),
      address: fd.get("address")
    },
    items: state.cart,
    total: getTotal()
  };

  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    el.feedback.innerHTML = `<div class="notice err">${data.error || "Erreur checkout"}</div>`;
    return;
  }

  state.cart = [];
  persistCart();
  renderCart();
  el.form.reset();
  el.feedback.innerHTML = `<div class="notice ok">${data.message}<br/>ID: ${data.orderId}</div>`;
});

wireFilters();
fetchProducts();
renderCart();
