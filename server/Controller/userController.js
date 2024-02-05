const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors")
const User = require("../models/userModel")
const sendTokenResponse = require("../utils/jwtToken")
const sendEmail = require("../utils/sendEmail")
const crypto = require("crypto");
const zlib = require("zlib");



// register user
exports.registerUser = catchAsyncErrors(async (req, res, next) => {

    const { name, email, password } = req.body;

    const user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: "this is a public id",
            url: "this is a url",
        },
    });

    sendTokenResponse(user, 200, res);
});


exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler("Please enter Email & Password", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    sendTokenResponse(user, 201, res);
});



// logout the user

exports.logout = catchAsyncErrors(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
    res.status(200).json({
        success: true,
        message: "Logged out"
    })
})

// forgot password


exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return next(new ErrorHandler("User not found with this email", 404));
    }

    // Generate reset token
    const resetToken = user.generateResetPasswordToken();
    await user.save({ validateBeforeSave: false }); // Save the reset token and its expiration date

    // Create reset URL
    const resetPasswordURL = `${req.protocol}://${req.get(
        "host"
    )}/api/v1/reset/${resetToken}`;

    // Create email message
    const message = `You are receiving this email because you (or someone else) has requested the reset of the password. Please click on the following link to reset your password:\n\n${resetPasswordURL}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`;

    try {
        // Send email
        await sendEmail({
            email: user.email,
            subject: "Ecommerce Password Reset Token",
            message,
        });

        // Email sent successfully
        res.status(200).json({
            success: true,
            message: "Password reset email sent",
        });
    } catch (error) {
        console.error("Error sending email:", error);

        // Clear reset token and expiration
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler("Email could not be sent", 500));
    }

});


// reset password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    // Get reset token from URL parameter
    const resetToken = req.params.token;

    // Hash the reset token and find the user by the hashed token
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        // If token is expired or invalid
        return next(new ErrorHandler("Invalid or expired reset token", 400));
    }

    // Check if new password and confirmPassword match
    if (req.body.password !== req.body.confirmPassword) {
        // If passwords do not match
        return next(new ErrorHandler("Passwords do not match", 400));
    }

    // Set the new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
});


// Middleware to get user details based on JWT token
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
    // Get the user's ID from the decoded JWT token
    const userId = req.user.id;

    // Find the user in the database
    const user = await User.findById(userId);

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    // Return the user's details
    res.status(200).json({
        success: true,
        user
    });
});


// Update user's password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    // Check if the current password matches
    if (!(await user.comparePassword(currentPassword))) {
        return next(new ErrorHandler("Current password is incorrect", 401));
    }

    // Check if new password and confirmPassword match
    if (newPassword !== confirmPassword) {
        return next(new ErrorHandler("Passwords do not match", 400));
    }

    // Hash the new password before saving
    user.password = newPassword;
    await user.save();

    // Send the success message in the response
    res.status(200).json({
        success: true,
        message: "Password updated successfully"
    });
});

// @desc    Update user profile
// @route   PUT /api/v1/profile/update
// @access  Private

exports.updateUserProfile = catchAsyncErrors(async (req, res, next) => {
    const { name, email } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    // Update user's name and email
    user.name = name;
    user.email = email;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user,
    });
});


// Get All user --Admin

exports.getAllUsersForAdmin = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find();

    if (!users || users.length === 0) {
        return next(new ErrorHandler("No users found", 404));
    }

    res.status(200).json({
        success: true,
        users
    });
});

// Get Single user [Admin]

exports.getSingleUserForAdmin = catchAsyncErrors(async (req, res, next) => {
    const userId = req.params.id;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    res.status(200).json({
        success: true,
        user
    });
});


// update user role

exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
    const { name, email, role } = req.body;

    if (!name || !email) {
        return next(new ErrorHandler("Name and email are required", 400));
    }

    const newUserData = {
        name,
        email,
        role
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        message: "User role updated successfully",
        user,
    });
});

// Delete user admin

exports.deleteUserByAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId);
        console.log(user); // Log the user object before calling remove()

        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        await User.deleteOne({ _id: userId });

        res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        console.log(error);
        return next(new ErrorHandler("Error deleting the user.", 500));
    }
});



