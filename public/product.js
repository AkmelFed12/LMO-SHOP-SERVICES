const money = (n) => `${Math.round(n).toLocaleString("fr-FR")} FCFA`;
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

async function run() {
  const res = await fetch(`/api/products?id=${encodeURIComponent(id || "")}`);
  if (!res.ok) {
    document.getElementById("productView").innerHTML = "<p>Produit introuvable.</p>";
    return;
  }
  const data = await res.json();
  const p = data.product;
  const specs = Object.entries(p.specs || {}).map(([k,v]) => `<div class='spec-row'><strong>${k}</strong><span>${v}</span></div>`).join("");
  document.title = `${p.name} | LMO SHOP SERVICES`;
  document.getElementById("productView").innerHTML = `
    <div class='row' style='align-items:flex-start; gap:20px; flex-wrap:wrap;'>
      <img src='${p.image}' alt='${p.name}' style='width:min(420px,100%); border-radius:12px;'>
      <div style='flex:1; min-width:260px;'>
        <h2>${p.name}</h2>
        <p class='price'>${money(p.price)}</p>
        <p class='muted'>${p.description}</p>
        <a class='btn-primary' style='display:inline-block; text-decoration:none;' href='https://wa.me/2250700000000?text=${encodeURIComponent("Bonjour, je veux commander " + p.name)}' target='_blank' rel='noopener noreferrer'>Commander via WhatsApp</a>
        <h3>Caracteristiques</h3>
        <div class='specs'>${specs}</div>
      </div>
    </div>`;

  const schema = {
    "@context":"https://schema.org",
    "@type":"Product",
    name:p.name,
    image:p.image,
    description:p.description,
    brand:{"@type":"Brand",name:p.brand || "LMO"},
    offers:{"@type":"Offer",priceCurrency:"XOF",price:p.price,availability:"https://schema.org/InStock"}
  };
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}
run();
