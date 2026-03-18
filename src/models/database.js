/**
 * Simple in-memory database for workshop purposes.
 * Uses plain JavaScript objects — no external dependencies needed.
 */

const store = {
  users: [],
  posts: [],
  comments: [],
};

function getStore() {
  return store;
}

function resetStore() {
  store.users = [];
  store.posts = [];
  store.comments = [];
}

/**
 * Query helpers that mimic common DB operations
 */
const db = {
  users: {
    findAll({ limit, offset } = {}) {
      let results = [...store.users];
      if (offset !== undefined) results = results.slice(offset);
      if (limit !== undefined) results = results.slice(0, limit);
      return results;
    },
    count() {
      return store.users.length;
    },
    findById(id) {
      return store.users.find((u) => u.id === id) || null;
    },
    findByEmail(email) {
      return store.users.find((u) => u.email === email) || null;
    },
    create(user) {
      store.users.push({ ...user, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
      return user;
    },
    update(id, data) {
      const idx = store.users.findIndex((u) => u.id === id);
      if (idx === -1) return null;
      store.users[idx] = { ...store.users[idx], ...data, updated_at: new Date().toISOString() };
      return store.users[idx];
    },
    delete(id) {
      const idx = store.users.findIndex((u) => u.id === id);
      if (idx === -1) return false;
      store.users.splice(idx, 1);
      return true;
    },
  },
  posts: {
    findAll() {
      return [...store.posts];
    },
    findById(id) {
      return store.posts.find((p) => p.id === id) || null;
    },
    create(post) {
      store.posts.push({ ...post, created_at: new Date().toISOString() });
      return post;
    },
  },
  comments: {
    findByPostId(postId) {
      return store.comments.filter((c) => c.post_id === postId);
    },
    create(comment) {
      store.comments.push({ ...comment, created_at: new Date().toISOString() });
      return comment;
    },
  },
};

module.exports = { db, getStore, resetStore };
