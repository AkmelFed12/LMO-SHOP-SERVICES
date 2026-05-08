const fs = require("fs");
const path = require("path");

module.exports = (req, res) => {
  const filePath = path.join(process.cwd(), "data", "products.json");
  const raw = fs.readFileSync(filePath, "utf8");
  const products = JSON.parse(raw);

  const { q = "", category = "all", sort = "featured" } = req.query;

  let filtered = products.filter((product) =>
    product.name.toLowerCase().includes(String(q).toLowerCase())
  );

  if (category !== "all") {
    filtered = filtered.filter((product) => product.category === String(category));
  }

  if (sort === "priceAsc") filtered.sort((a, b) => a.price - b.price);
  if (sort === "priceDesc") filtered.sort((a, b) => b.price - a.price);
  if (sort === "rating") filtered.sort((a, b) => b.rating - a.rating);

  res.status(200).json({
    count: filtered.length,
    products: filtered,
    categories: ["all", ...new Set(products.map((product) => product.category))]
  });
};
