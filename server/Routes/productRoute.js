const express = require("express");
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetails,
  createProductReview,
  getProductReview,
  deleteProductReview,
} = require("../Controller/productController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.get("/products", getAllProducts);

// Route to create a new product (requires authentication)
router.post(
  "/admin/product/new",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  createProduct
);

// Route to update, delete, and get details of a specific product (requires authentication)
router
  .route("/admin/product/:id")
  .put(isAuthenticatedUser, updateProduct) // Update product
  .delete(isAuthenticatedUser, deleteProduct); // Delete product

router.route("/product/:id").get(getProductDetails);

router.route("/review").put(isAuthenticatedUser, createProductReview);

router
  .route("/reviews")
  .get(getProductReview)
  .delete(isAuthenticatedUser, deleteProductReview);

module.exports = router;

// {
//     "email": "jaddu3110@gmail.com",
//     "password":"newPassword123"kk
// }
