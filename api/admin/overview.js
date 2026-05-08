const { loadDb, saveDb, getUserFromToken, sanitizeUser, addAudit } = require("../store");

module.exports = (req, res) => {
  const db = loadDb();
  const token = req.headers["x-auth-token"];
  const currentUser = getUserFromToken(db, token);

  if (!currentUser || currentUser.role !== "admin") {
    return res.status(403).json({ error: "Acces refuse" });
  }

  const users = db.users.map((user) => sanitizeUser(user));
  const orders = [...db.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  addAudit(db, currentUser.id, "ADMIN_OVERVIEW_READ", { users: users.length, orders: orders.length });
  saveDb(db);

  return res.status(200).json({
    users,
    orders,
    metrics: {
      usersCount: users.length,
      ordersCount: orders.length,
      revenue: orders.reduce((sum, order) => sum + order.total, 0)
    }
  });
};
