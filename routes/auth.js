const router = require('express').Router();
const _ = require("lodash");
const { verifyTokenAndAuthorization, verifyTokenUser, verifyTokenAndAdmin, verifyToken } = require("../verifyToken");
const  {
    registerAdmin, loginAdmin,
    registerUser, loginUser,
    changePassword, resetPassword,
    forgotPassword, uploadChurchLogo
} = require('../controllers/auth')


//CREAT ADMIN USER WITHOUT EMAIL VERIFICATION
// router.route("/create-admin").post(registerAdmin);
router.post("/create-admin", registerAdmin);
router.post("/admin-login", loginAdmin);

router.post("/register", verifyTokenAndAdmin, registerUser);
router.post('/login', loginUser);

router.put("/forgot-password", forgotPassword);
router.put("/reset-password", resetPassword);
router.put("/change-password", verifyTokenUser, changePassword);
router.put("/uploadchurchlogo/:id", verifyTokenAndAdmin, uploadChurchLogo);

module.exports = router
