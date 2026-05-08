const { loadDb, saveDb, sanitizeUser, hashPassword, addAudit } = require("./store");

module.exports = (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { username, email, contact, password } = req.body || {};
  if (!username || !email || !contact || !password) {
    return res.status(400).json({ error: "Tous les champs sont obligatoires" });
  }

  const db = loadDb();
  const exists = db.users.some((u) => u.username.toLowerCase() === username.toLowerCase());
  if (exists) return res.status(409).json({ error: "Nom d'utilisateur deja utilise" });

  const id = `USR-${String(db.users.length + 1).padStart(4, "0")}`;
  const user = {
    id,
    username,
    email,
    contact,
    passwordHash: hashPassword(password),
    role: "client",
    createdAt: new Date().toISOString()
  };

  db.users.push(user);
  addAudit(db, id, "REGISTER", { username, email });
  saveDb(db);

  return res.status(201).json({ user: sanitizeUser(user) });
};
