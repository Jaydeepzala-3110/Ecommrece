const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return next(new ErrorHandler("Please log in to access this resource", 401));
  }

  try {
    const decodedJwt = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decodedJwt.id);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    req.user = user;

    next();
  } catch (error) {
    return next(new ErrorHandler("Invalid token", 401));
  }
});

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    console.log("Allowed Roles:", roles);
    console.log("User Role:", req.user.role);

    // Check if the user's role is included in the allowed roles
    if (!roles.includes(req.user.role)) {
      return new ErrorHandler(
        `User role ${req.user.role} is not authorized to access this resource`,
        403
      );
    }

    next();
  };
};