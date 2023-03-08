const router = require("express").Router();
const postContoller = require("../controllers/postController");
const requireUser = require("../middlewares/requireUser");

router.post("/", requireUser, postContoller.createPostController);
router.post("/like", requireUser, postContoller.likeAndUnlikePost);
router.put("/", requireUser, postContoller.updatePostController);
router.delete("/", requireUser, postContoller.deletePostController);

module.exports = router;
