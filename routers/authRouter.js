const router = require("express").Router();
const authController = require("../controllers/authController");

router.post("/signup", authController.signupController);
router.post("/login", authController.loginController);
router.get("/refresh", authController.refreshAcessTokenController);
router.post("/logout", authController.logoutController);

module.exports = router;
