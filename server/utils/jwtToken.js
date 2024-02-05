// Function to create a JSON response with token and message
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getJWTToken();

    const options = {
        expire: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httponly: true
    }
    res.status(statusCode).cookie("token" , token , options).json({
        success: true,
        token,
        user
    });
};

module.exports = sendTokenResponse; // Export the function without 'exports.'
