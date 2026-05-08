const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DB_PATH = path.join(process.cwd(), "data", "db.json");
const TOKEN_SECRET = process.env.TOKEN_SECRET || "LMO_SUPER_SECRET_CHANGE_ME";
const TOKEN_TTL_MS = 1000 * 60 * 60 * 12;

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, original] = String(storedHash).split(":");
  if (!salt || !original) return false;
  const candidate = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(original, "hex"), Buffer.from(candidate, "hex"));
}

function signToken(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", TOKEN_SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verifyToken(token) {
  try {
    const [body, sig] = String(token || "").split(".");
    if (!body || !sig) return null;
    const expected = crypto.createHmac("sha256", TOKEN_SECRET).update(body).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function sanitizeUser(user) {
  return { id: user.id, username: user.username, email: user.email, contact: user.contact, role: user.role, createdAt: user.createdAt };
}

function createDefaultDb() {
  return {
    users: [{ id: "USR-ADMIN-0001", username: "Admin", passwordHash: hashPassword("Mo74724233"), email: "admin@lmoshopservices.ci", contact: "+2250700000000", role: "admin", createdAt: new Date().toISOString() }],
    orders: [],
    auditLogs: [],
    loginAttempts: {},
    events: []
  };
}

function loadDb() {
  if (!fs.existsSync(DB_PATH)) {
    const seed = createDefaultDb();
    fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2));
    return seed;
  }
  const db = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  let changed = false;
  db.users = Array.isArray(db.users) ? db.users : [];
  db.orders = Array.isArray(db.orders) ? db.orders : [];
  db.auditLogs = Array.isArray(db.auditLogs) ? db.auditLogs : [];
  db.events = Array.isArray(db.events) ? db.events : [];
  db.loginAttempts = db.loginAttempts && typeof db.loginAttempts === "object" ? db.loginAttempts : {};

  db.users.forEach((user) => {
    if (user.password && !user.passwordHash) {
      user.passwordHash = hashPassword(user.password);
      delete user.password;
      changed = true;
    }
  });

  if (!db.users.some((u) => u.role === "admin" && u.username === "Admin")) {
    db.users.push(createDefaultDb().users[0]);
    changed = true;
  }

  if (changed) saveDb(db);
  return db;
}

function saveDb(db) { fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }

function addAudit(db, actorId, action, details = {}) {
  db.auditLogs.push({ id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`, actorId, action, details, createdAt: new Date().toISOString() });
}

function createSessionToken(user) { return signToken({ sub: user.id, role: user.role, exp: Date.now() + TOKEN_TTL_MS }); }

function getUserFromToken(db, token) {
  const payload = verifyToken(token);
  if (!payload) return null;
  return db.users.find((user) => user.id === payload.sub) || null;
}

module.exports = { hashPassword, verifyPassword, sanitizeUser, loadDb, saveDb, addAudit, createSessionToken, getUserFromToken };
