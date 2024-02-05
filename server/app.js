const express = require('express');
const cors = require('cors');
const cookieParser = require("cookie-parser")
const dotenv = require('dotenv');
const connectDatabase = require('./config/database');
const ErrorMiddleware = require("./middleware/error");
const productRoutes = require("./Routes/productRoute");
const userRoutes = require("./Routes/userRoute")
const helmet = require('helmet');
const orderRoutes = require("./Routes/orderRoute")
dotenv.config();

const app = express();

connectDatabase();

app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
    },
}));

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
};

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

app.use("/api/v1", productRoutes);
app.use("/api/v1", userRoutes)
app.use("/api/v1", orderRoutes)

app.use(ErrorMiddleware);

app.get('/', (req, res) => {
    res.send('Welcome to the Express server!');
});

module.exports = app;
