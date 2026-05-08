const { loadDb, sanitizeUser, verifyPassword, createSessionToken, addAudit, saveDb } = require("./store");

module.exports = (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "Identifiants requis" });

  const db = loadDb();
  const user = db.users.find((u) => u.username.toLowerCase() === String(username).toLowerCase());
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: "Identifiants invalides" });
  }

  const token = createSessionToken(user);
  addAudit(db, user.id, "LOGIN_SUCCESS", { username: user.username });
  saveDb(db);

  return res.status(200).json({ token, user: sanitizeUser(user) });
};
