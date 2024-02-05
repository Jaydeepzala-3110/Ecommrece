const app = require('./app'); // Import the Express app


const port = process.env.PORT || 3000;

process.on('uncaughtException', (error) => {
    console.log('Uncaught Exception:', error.message);
    console.log("Shutting down the server due to uncaught exception");

    server.close(() => {
        process.exit(1);
    });
});

const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

process.on("unhandledRejection", (err) => {
    console.log(`Error : ${err.message}`)
    console.log("Shutting down the server due to unhandled rejection")

    server.close(() => {
        process.exit(1)
    })
})