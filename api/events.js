const { loadDb, saveDb, addAudit } = require("./store");

module.exports = (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { type, payload } = req.body || {};
  if (!type) return res.status(400).json({ error: "Event type requis" });

  const db = loadDb();
  db.events.push({ id: `EVT-${Date.now()}`, type, payload: payload || {}, createdAt: new Date().toISOString() });
  addAudit(db, "SYSTEM", "EVENT_TRACK", { type });
  saveDb(db);

  return res.status(201).json({ ok: true });
};
