const express = require("express");
const router = express.Router();
const {
  addForm,
  postValue,
  viewProducts,
  deleteProduct,
  viewEditPage,
  EditPage,
  searchProduct,
  sorting,
} = require("../controller/adminController");

const multer = require("multer");
const path = require("path");

//to use the images folder after adding it to database
const fileStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, path.join(__dirname, "..", "uploads","product"), (err, data) => {
      if (err) throw err;
    });
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname, (err, data) => {
      if (err) throw err;
    });
  },
});

//file.mimetype==='image/jpg'
const fileFilter = (req, file, callback) => {
  if (
    file.mimetype.includes("png") ||
    file.mimetype.includes("jpg") ||
    file.mimetype.includes("jpeg")||
    file.mimetype.includes("webp")
  ) {
    callback(null, true);
  } else {
    callback(null, false);
  }
};

const upload = multer({
  storage: fileStorage,
  fileFilter: fileFilter,
  limits: { fieldSize: 1024 * 1024 * 5 },
});

router.get("/admin/add-product", addForm);
// router.post("/admin/postData",upload.single('product_image'), postValue);
router.post("/admin/postData", upload.array("product_images", 2), postValue);

router.get("/admin/products", viewProducts);

router.get("/admin/deleteProduct/:id", deleteProduct);

router.get("/admin/editProduct/:id", viewEditPage);
router.post("/admin/newProduct", EditPage);

router.post("/admin/searchProduct", searchProduct);

router.get("/sorting/:order", sorting);

module.exports = router;
