const { loadDb, saveDb, addAudit } = require("./store");

module.exports = (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { customer, items, total, payment } = req.body || {};
  if (!customer || !customer.fullName || !customer.email || !customer.contact || !Array.isArray(items) || !items.length) {
    return res.status(400).json({ error: "Payload de commande invalide" });
  }

  const db = loadDb();
  const order = {
    orderId: `ORD-${Date.now()}`,
    customerId: customer.customerId || "INVITE",
    customerName: customer.fullName,
    email: customer.email,
    contact: customer.contact,
    address: customer.address || "Non renseignee",
    items,
    total,
    payment: payment || { method: "Paiement a la livraison", status: "en_attente" },
    createdAt: new Date().toISOString(),
    status: "Nouvelle"
  };

  db.orders.push(order);
  addAudit(db, customer.customerId || "INVITE", "ORDER_CREATED", { orderId: order.orderId, total });
  saveDb(db);

  return res.status(201).json({ message: "Commande enregistree avec succes.", orderId: order.orderId, total: order.total, createdAt: order.createdAt });
};
