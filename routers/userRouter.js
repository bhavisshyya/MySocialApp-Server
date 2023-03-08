const requireUser = require("../middlewares/requireUser"); // middleware for authentication of user
const router = require("express").Router();
const UserController = require("../controllers/userController"); //end point of the user api

router.post(
  "/follow",
  requireUser,
  UserController.followOrUnfollowUserController
);

router.get(
  "/getFeedData",
  requireUser,
  UserController.getPostOfFollowing
);

router.get("/getMyPost", requireUser, UserController.getMyPostController);

router.get("/getUserPost", requireUser, UserController.getUserPostController);

router.delete("/", requireUser, UserController.deleteMyProfileController);

router.get("/getMyInfo", requireUser, UserController.getMyInfo);

router.put("/" ,requireUser, UserController.updateUserProfile);

router.post('/getUserProfile' , requireUser ,UserController.getUserProfile); 

module.exports = router;
