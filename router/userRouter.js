const express = require("express");
const {
  viewHome,
  getProductsUser,
  getSingleProduct,
} = require("../controller/userController");
const router = express.Router();

router.get("/", viewHome);
router.get('/user/products',getProductsUser)
router.get('/user/single-product/:id',getSingleProduct)

module.exports = router;
