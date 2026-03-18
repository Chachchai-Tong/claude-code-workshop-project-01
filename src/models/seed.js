const { db, resetStore } = require("./database");
const { v4: uuidv4 } = require("uuid");
const { hashSync } = require("../utils/hash");

function seed() {
  resetStore();

  const hash = hashSync("password123");

  const userIds = [];
  for (let i = 1; i <= 25; i++) {
    const id = uuidv4();
    userIds.push(id);
    db.users.create({
      id,
      name: `User ${i}`,
      email: `user${i}@example.com`,
      password: hash,
      role: i === 1 ? "admin" : "user",
    });
  }

  const postIds = [];
  for (let i = 0; i < 10; i++) {
    const id = uuidv4();
    postIds.push(id);
    db.posts.create({
      id,
      title: `Post Title ${i + 1}`,
      content: `This is the content of post ${i + 1}.`,
      author_id: userIds[i % userIds.length],
      published: true,
    });
  }

  for (let i = 0; i < 20; i++) {
    db.comments.create({
      id: uuidv4(),
      content: `Comment ${i + 1} on a post`,
      post_id: postIds[i % postIds.length],
      author_id: userIds[i % userIds.length],
    });
  }

  console.log("Seeded: 25 users, 10 posts, 20 comments");
}

// Run if called directly
if (require.main === module) {
  seed();
}

module.exports = { seed };
