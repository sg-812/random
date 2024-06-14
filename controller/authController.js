const AuthModel = require("../model/authModel");
const bcrypt = require("bcryptjs");

// token setup
const TokenModel = require("../model/tokenModel");
const jwt = require("jsonwebtoken");

// mail setup
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: "smtp",
  port: 465,
  secure: false,
  requireTLS: true,
  service: "gmail",
  auth: {
    user: "soumi.webskitters@gmail.com",
    pass: "blvs hwtw nrvo lgbw",
  },
});

// ************************************ Registration Part ************************************

//view registration page
const viewReg = (req, res) => {
  let msg = req.flash("msg");
  let errMsg = req.flash("error");
  console.log("Flash msg", msg, errMsg);
  let message = msg.length > 0 ? msg[0] : null;
  let errMessage = errMsg.length > 0 ? errMsg[0] : null;
  res.render("Auth/registration", {
    title: "registration",
    msg: message,
    errorMsg: errMessage,
  });
};

//post registration form's value
const postReg = async (req, res) => {
  try {
    // console.log("Collected from registration form", req.body);
    // console.log(req.files);
    let verifyUser = await AuthModel.findOne({
      $or: [{ email: req.body.mail }, { username: req.body.username }],
    });
    console.log("User found", verifyUser);
    if (verifyUser == null) {
      if (req.body.password === req.body.cpassword) {
        let hashPassword = await bcrypt.hash(req.body.password, 12);
        // console.log("After hashing:", hashPassword);
        let authData = new AuthModel({
          firstname: req.body.fname,
          lastname: req.body.lname,
          username: req.body.username,
          gender: req.body.gender,
          dob: req.body.dob,
          email: req.body.mail,
          password: hashPassword,
          user_image: req.files.user_image[0].filename,
          identity_proof: req.files.id_proof[0].filename,
        });
        // console.log("Auth data to be saved ",authData);
        let savedUser = await authData.save();
        if (savedUser) {
          console.log("Registration data sent to database");
          const token_jwt = jwt.sign(
            { email: req.body.email },
            "secretkey123456789@secretkey123456789",
            { expiresIn: "1h" }
          );
          const Token_data = new TokenModel({
            token: token_jwt,
            _userId: savedUser._id,
          });
          let token_saved = await Token_data.save();
          if (token_saved) {
            // mail
            let mailOptions = {
              from: "soumi.webskitters@gmail.com",
              to: req.body.mail,
              subject: "Email Verification",
              text:
                "Hello " +
                req.body.fname +
                ",\n\nYou have succefully submitted your data to be registered.Please verify your account by clicking the link: \n" +
                "http://" +
                req.headers.host +
                "/mail_confirmation/" +
                req.body.mail +
                "/" +
                token_jwt +
                "\n\nThank You!\n",
            };

            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                console.log("Error to send mail:", error);
                res.redirect("/auth/sign-up");
              } else {
                console.log("Email sent: ", info.response);
                req.flash(
                  "msg",
                  "Please check your mail to verify user address"
                );
                res.redirect("/auth/sign-up");
              }
            });
          } else {
            console.log("Error to save token");
          }
        }
      } else {
        req.flash("error", "password mismatch");
        res.redirect("/auth/sign-up");
      }
    } else {
      if (verifyUser.username === req.body.username) {
        req.flash("msg", "Existing username, try with another username");
        res.redirect("/auth/sign-up");
      } else if (verifyUser.email === req.body.mail) {
        req.flash("msg", "Existing email , try with another email address");
        res.redirect("/auth/sign-up");
      }
    }
  } catch (err) {
    console.log("Registration failed", err);
  }
};

//verify user
const mail_confirmation = async (req, res) => {
  try {
    // console.log(
    //   "Received mail from confirmation mail",
    //   req.params.email,
    //   req.params.token
    // );
    let token_user =await TokenModel.findOne({ token: req.params.token });
      //  console.log(
      //   "Data of user whose mail verification is conducting ",
      //    token_user 
      // );
    if (!token_user) {
      console.log("Verification Link May Be Expired :(");
    } else {
      let user_data = await AuthModel.findOne({ _id:token_user._userId,email: req.params.email });
   
      if (user_data.isVerified) {
        console.log("User already Verified");
        req.flash("msg", "User already Verified, go to login ");
        res.redirect("/auth/sign-up");
      } else {
        user_data.isVerified = true;
        let save_res = await user_data.save();
        if (save_res) {
          console.log("Your Account Successfully Verified");
          // console.log('msg','Your Account Successfully Verified')
          res.redirect("/verified");
        }
      }
    }
  } catch (error) {
    console.log("Mail verification error", error);
    res.redirect("/not_verified");
  }
};

//Verified page display
const verifiedUser = (req, res) => {
  res.render("Auth/verification/VerifiedPage", {
    title: "Verified user",
  });
};

//Not verified page display
const notVerifiedUser = (req, res) => {
  res.render("Auth/verification/NotVerifiedPage", {
    title: "Not Verified user",
  });
};

// ************************************ Login Part ************************************

//view login page
const viewLogin = (req, res) => {
  let errMsg = req.flash("error");
  let pass_errMsg = req.flash("pass_error");
  // console.log("Flash msg", errMsg,pass_errMsg);
  let emessage = errMsg.length > 0 ? errMsg[0] : null;
  let pmessage = pass_errMsg.length > 0 ? pass_errMsg[0] : null;

  res.render("Auth/login", {
    title: "login",
    mailError: emessage,
    passError: pmessage,
  });
};

//post login form's value
const postLogin = async (req, res) => {
  try {
    // console.log("After login", req.body)
    let existingUser = await AuthModel.findOne({
      $or: [{ email: req.body.mail }, { username: req.body.user_name }],
    });
    // console.log("existing",existingUser);
    if (!existingUser) {
      // console.log("Invalid email");
      req.flash("error", "Invalid email ");
      res.redirect("/auth/sign-in");
    } else {
      if (!existingUser.isVerified) {
        console.log("Mail verification not done");
        res.redirect("/not_verified");
      } else {
        let result = await bcrypt.compare(
          req.body.password,
          existingUser.password
        );
        //  console.log(result,"password comparison");
        if (result) {
          //isLoggedIn is a user defined variable in the session to check user is logged in or not
          req.session.isLoggedIn = true;
          //user is a variable in session to store logged in user value
          req.session.user = existingUser;
          await req.session.save((err) => {
            if (err) {
              console.log("Session saving error:", err);
            } else {
              console.log("Login successfull");
              // req.flash("success", "Login successfull");
              return res.redirect("/auth/profile");
            }
          });
        } else {
          console.log("Wrong password");
          req.flash("pass_error", "Wrong password");
          res.redirect("/auth/sign-in");
        }
      }
    }
  } catch (error) {
    console.log("Login error");
  }
};

// ************************************ Forget Password Part ************************************

const viewForgetPass = (req, res) => {
  // let message=req.flash('msg');
  // // console.log("error message: ",message)
  // let msg=(message.length>0)?message[0]:null;
  res.render("Auth/ForgetPassword", {
    title: "forget password",
  });
};

// ************************************ Profile Part ************************************

//view profile page
const viewProfile = async (req, res) => {
  // console.log("Existing id of the user logged in",req.user._id);
  let userdata = await AuthModel.findById(req.user._id);
  console.log("Profile of the user logged in", userdata);
  res.render("Auth/profile", {
    title: "profile",
    info: userdata,
  });
};

// ************************************Logout Part ************************************

//logout
const signOut = async (req, res) => {
  let destroyed = await req.session.destroy();
  console.log(destroyed, "destroyed");
  res.redirect("/auth/sign-in");
};
module.exports = {
  viewReg,
  postReg,
  verifiedUser,
  notVerifiedUser,
  viewLogin,
  postLogin,
  viewForgetPass,
  viewProfile,
  signOut,
  mail_confirmation,
};

//webskitters.soumi@gmail.com  Soumi@123
