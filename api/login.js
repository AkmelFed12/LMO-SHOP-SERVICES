const { loadDb, sanitizeUser, verifyPassword, createSessionToken, addAudit, saveDb } = require("./store");

module.exports = (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "Identifiants requis" });

  const db = loadDb();
  const key = String(username).toLowerCase();
  const now = Date.now();
  const attempt = db.loginAttempts[key] || { count: 0, blockedUntil: 0 };

  if (attempt.blockedUntil > now) {
    const secs = Math.ceil((attempt.blockedUntil - now) / 1000);
    return res.status(429).json({ error: `Trop de tentatives. Reessayez dans ${secs}s.` });
  }

  const user = db.users.find((u) => u.username.toLowerCase() === key);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    attempt.count += 1;
    if (attempt.count >= 5) {
      attempt.blockedUntil = now + 1000 * 60 * 5;
      attempt.count = 0;
    }
    db.loginAttempts[key] = attempt;
    addAudit(db, "SYSTEM", "LOGIN_FAIL", { username });
    saveDb(db);
    return res.status(401).json({ error: "Identifiants invalides" });
  }

  db.loginAttempts[key] = { count: 0, blockedUntil: 0 };
  const token = createSessionToken(user);
  addAudit(db, user.id, "LOGIN_SUCCESS", { username: user.username });
  saveDb(db);

  return res.status(200).json({ token, user: sanitizeUser(user) });
};
