const crypto = require("crypto");

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

function hashSync(password) {
  const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");
  const hash = crypto.scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

function compareSync(password, stored) {
  const [salt, hash] = stored.split(":");
  const derived = crypto.scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(derived, "hex"));
}

module.exports = { hashSync, compareSync };
