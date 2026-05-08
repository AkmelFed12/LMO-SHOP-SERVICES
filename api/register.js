const { store, sanitizeUser } = require("./store");

module.exports = (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { username, email, contact, password } = req.body || {};
  if (!username || !email || !contact || !password) {
    return res.status(400).json({ error: "Tous les champs sont obligatoires" });
  }

  const exists = store.users.some((u) => u.username.toLowerCase() === username.toLowerCase());
  if (exists) return res.status(409).json({ error: "Nom d'utilisateur deja utilise" });

  const id = `USR-${String(store.users.length + 1).padStart(4, "0")}`;
  const user = {
    id,
    username,
    email,
    contact,
    password,
    role: "client",
    createdAt: new Date().toISOString()
  };

  store.users.push(user);
  return res.status(201).json({ user: sanitizeUser(user) });
};
