const express = require("express");
const isAuthenticated = require("../middleware/isAuthenticated");
const upload = require("../middleware/multer");
const {
  createPost,
  getAllPost,
  getUserPosts,
  saveOrUnsavePost,
  deletePost,
} = require("../controllers/postController");

const router = express.Router();

// Define the routes
router.post(
  "/create-post",
  isAuthenticated,
  upload.single("image"),
  createPost
);
router.get("/all", getAllPost);
router.get("/user-post/:id", getUserPosts);
router.post("/save-unsave-post/:postId", isAuthenticated, saveOrUnsavePost);
router.delete("/delete-post/:id", isAuthenticated, deletePost);

module.exports = router;
