const express = require("express");
const {
  viewReg,
  postReg,
  viewLogin,
  postLogin,
  viewProfile,
  signOut,
  mail_confirmation,
  verifiedUser,
  notVerifiedUser,
  viewForgetPass
} = require("../controller/authController");
const router = express.Router();

// ************************************ Image upload setup ************************************
const multer = require("multer");
const path = require("path");

//to use the images folder after adding it to database
const fileStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(
      null,
      path.join(__dirname, "..", "uploads", "auth"),
      (err, data) => {
        if (err) throw err;
      }
    );
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname, (err, data) => {
      if (err) throw err;
    });
  },
});

// MIME (Multipurpose Internet Mail Extensions)
//file.mimetype==='image/jpg'
const fileFilter = (req, file, callback) => {
  if (
    file.mimetype.includes("png") ||
    file.mimetype.includes("jpg") ||
    file.mimetype.includes("jpeg") ||
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

const upload_type = upload.fields([
  { name: "user_image", maxCount: 1 },
  { name: "id_proof", maxCount: 1 },
]);

// ************************************ Path setup ************************************

// registration paths
router.get("/auth/sign-up", viewReg);
router.post("/auth/sign-up", upload_type, postReg);
router.get('/mail_confirmation/:email/:token',mail_confirmation);

router.get('/verified',verifiedUser);
router.get('/not_verified',notVerifiedUser);

// login paths
router.get("/auth/sign-in", viewLogin);
router.post("/auth/sign-in", postLogin);

//forget password paths
router.get("/auth/change_password", viewForgetPass);

//profile paths
router.get("/auth/profile", viewProfile);

//logout paths
router.get("/auth/sign-out", signOut);
module.exports = router;
