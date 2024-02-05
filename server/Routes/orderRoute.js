const express = require("express");
const {createOrder, getSingleOrder , getMyOrders, getAllOrders,deleteOrder, updateOrderStatus } = require("../Controller/orderController");
const {isAuthenticatedUser, authorizeRoles} = require("../middleware/auth");

const router = express.Router();

router.route("/order/new").post(isAuthenticatedUser,createOrder)

router.route("/order/:id").get(isAuthenticatedUser, getSingleOrder)

router.route("/orders/me").get(isAuthenticatedUser, getMyOrders)

router.route("/admin/orders").get(isAuthenticatedUser, authorizeRoles("admin"), getAllOrders)

router.route("/admin/order/:id")
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOrder)
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateOrderStatus);

module.exports = router;
