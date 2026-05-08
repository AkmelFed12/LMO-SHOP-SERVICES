const { loadDb, saveDb, getUserFromToken, sanitizeUser, addAudit } = require("../store");

module.exports = (req, res) => {
  const db = loadDb();
  const token = req.headers["x-auth-token"];
  const currentUser = getUserFromToken(db, token);

  if (!currentUser || currentUser.role !== "admin") return res.status(403).json({ error: "Acces refuse" });

  const users = db.users.map((u) => sanitizeUser(u));
  const orders = [...db.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const revenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const avgBasket = orders.length ? revenue / orders.length : 0;

  const productCount = {};
  orders.forEach((o) => (o.items || []).forEach((i) => { productCount[i.name] = (productCount[i.name] || 0) + Number(i.qty || 1); }));
  const topProducts = Object.entries(productCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, qty]) => ({ name, qty }));

  const cartEvents = db.events.filter((e) => e.type === "cart_add").length;
  const checkoutEvents = db.events.filter((e) => e.type === "checkout_success").length;
  const conversionRate = cartEvents ? (checkoutEvents / cartEvents) * 100 : 0;

  addAudit(db, currentUser.id, "ADMIN_OVERVIEW_READ", { users: users.length, orders: orders.length });
  saveDb(db);

  return res.status(200).json({
    users,
    orders,
    topProducts,
    metrics: {
      usersCount: users.length,
      ordersCount: orders.length,
      revenue,
      avgBasket,
      cartEvents,
      checkoutEvents,
      conversionRate
    }
  });
};
