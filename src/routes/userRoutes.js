const { Router } = require("express");
const userController = require("../controllers/userController");
const { authenticateToken } = require("../middleware/auth");

const router = Router();

router.get("/", userController.getUsers);
router.get("/:id", userController.getUserById);
router.post("/", userController.createUser);
router.put("/:id", authenticateToken, userController.updateUser);
router.delete("/:id", authenticateToken, userController.deleteUser);

module.exports = router;
