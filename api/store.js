const crypto = require("crypto");

const store = {
  users: [
    {
      id: "USR-ADMIN-0001",
      username: "Admin",
      password: "Mo74724233",
      email: "admin@lmoshopservices.ci",
      contact: "+2250700000000",
      role: "admin",
      createdAt: new Date().toISOString()
    }
  ],
  sessions: {},
  orders: []
};

function createToken() {
  return crypto.randomBytes(24).toString("hex");
}

function sanitizeUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    contact: user.contact,
    role: user.role,
    createdAt: user.createdAt
  };
}

function getUserByToken(token) {
  const userId = store.sessions[token];
  if (!userId) return null;
  return store.users.find((user) => user.id === userId) || null;
}

module.exports = {
  store,
  createToken,
  sanitizeUser,
  getUserByToken
};
