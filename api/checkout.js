module.exports = (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { customer, items, total } = req.body || {};

  if (!customer || !customer.fullName || !customer.email || !Array.isArray(items) || !items.length) {
    return res.status(400).json({ error: "Invalid order payload" });
  }

  return res.status(201).json({
    message: "Commande enregistree avec succes (mode demo).",
    orderId: `ORD-${Date.now()}`,
    total,
    createdAt: new Date().toISOString()
  });
};
