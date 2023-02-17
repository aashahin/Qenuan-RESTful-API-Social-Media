const { check } = require("express-validator");
const { validatorError } = require("./validatorError");
const User = require("./../../model/user/User");

exports.createUserVaildator = [
  check("firstName")
    .notEmpty()
    .withMessage("First Name is required.")
    .isString()
    .withMessage("Please Enter Valid Name"),
  check("lastName")
    .notEmpty()
    .withMessage("Last Name is required.")
    .isString()
    .withMessage("Please Enter Valid Name"),
  check("email")
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please Enter Valid Email")
    .custom((email) =>
      User.findOne({ email }).then((err) => {
        if (err) {
          return Promise.reject(new Error("User Already exist."));
        }
      })
    ),
  check("password")
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 8 })
    .withMessage("The Minimum for password is 8"),
  check("passwordConfirmation")
    .notEmpty()
    .withMessage("Password Confirmation is required.")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password confirmation does not match password");
      }
      return true;
    }),
  validatorError,
];
