const { store, createToken, sanitizeUser } = require("./store");

module.exports = (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "Identifiants requis" });

  const user = store.users.find((u) => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: "Identifiants invalides" });

  const token = createToken();
  store.sessions[token] = user.id;

  return res.status(200).json({
    token,
    user: sanitizeUser(user)
  });
};
