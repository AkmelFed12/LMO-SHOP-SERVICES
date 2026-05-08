const fs = require("fs");
const path = require("path");

module.exports = (req, res) => {
  const filePath = path.join(process.cwd(), "data", "products.json");
  const products = JSON.parse(fs.readFileSync(filePath, "utf8"));

  const { q = "", category = "all", sort = "featured", brand = "all", minPrice = "0", maxPrice = "999999999", id, slug } = req.query;

  if (id || slug) {
    const item = products.find((p) => p.id === id || p.slug === slug);
    if (!item) return res.status(404).json({ error: "Produit introuvable" });
    return res.status(200).json({ product: item });
  }

  let filtered = products.filter((p) => p.name.toLowerCase().includes(String(q).toLowerCase()));
  if (category !== "all") filtered = filtered.filter((p) => p.category === String(category));
  if (brand !== "all") filtered = filtered.filter((p) => (p.brand || "").toLowerCase() === String(brand).toLowerCase());

  const min = Number(minPrice) || 0;
  const max = Number(maxPrice) || Number.MAX_SAFE_INTEGER;
  filtered = filtered.filter((p) => p.price >= min && p.price <= max);

  if (sort === "priceAsc") filtered.sort((a, b) => a.price - b.price);
  if (sort === "priceDesc") filtered.sort((a, b) => b.price - a.price);
  if (sort === "rating") filtered.sort((a, b) => b.rating - a.rating);

  return res.status(200).json({
    count: filtered.length,
    products: filtered,
    categories: ["all", ...new Set(products.map((p) => p.category))],
    brands: ["all", ...new Set(products.map((p) => p.brand).filter(Boolean))]
  });
};
