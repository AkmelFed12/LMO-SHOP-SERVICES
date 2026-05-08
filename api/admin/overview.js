const { store, getUserByToken, sanitizeUser } = require("../store");

module.exports = (req, res) => {
  const token = req.headers["x-auth-token"];
  const currentUser = getUserByToken(token);

  if (!currentUser || currentUser.role !== "admin") {
    return res.status(403).json({ error: "Acces refuse" });
  }

  const users = store.users.map((user) => sanitizeUser(user));
  const orders = [...store.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
