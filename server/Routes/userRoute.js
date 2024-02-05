const express = require("express")
const {
    registerUser, loginUser,
    logout, forgotPassword,
    resetPassword, getUserDetails,
    updatePassword, updateUserProfile, getAllUsersForAdmin, updateUserRole,
    deleteUserByAdmin, getSingleUserForAdmin
} = require("../Controller/userController");

const {isAuthenticatedUser, authorizeRoles} = require("../middleware/auth");
const router = express.Router()

router.route("/register").post(registerUser)

router.route("/login").post(loginUser)

router.route("/password/forgot").post(forgotPassword)

router.route("/password/reset/:token").put(resetPassword)

router.route("/logout").get(logout)

router.route("/me").get(isAuthenticatedUser, getUserDetails)

router.route("/password/update").put(isAuthenticatedUser, updatePassword)

router.route("/me/update").put(isAuthenticatedUser, updateUserProfile);

router.route("/admin/users")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getAllUsersForAdmin);

// Route to get user's own information
router.route("/admin/user/:id")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getSingleUserForAdmin)
    .put(isAuthenticatedUser, authorizeRoles("admin" ,"user"), updateUserRole)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUserByAdmin);



module.exports = router

// {
//     "name": "dOREMON    ",
//     "email": "dora@gmail.com",
//     "password":"12345678"
// }

//
// {
//     "name": "botdev",
//     "email": "botdev@gmail.com",
//     "password":"botdev123"
// }