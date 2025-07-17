const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const globalErrorHandler = require("./controllers/errorController");
const mongoSanitize = require("express-mongo-sanitize");
const path = require("path");
const AppError = require("./utils/appError");
const userRouter = require("./routes/userRoutes");

const app = express();

// middleware is running in the middle of the request and response life cycle
app.use("/", express.static("uploads"));

// parse cookie from the client
app.use(cookieParser());

// set various security headers
app.use(helmet());

// allows cors request from this specific origin
app.use(
  cors({
    origin: ["https://localhost:3000"],
    credentials: true, // allows cookies to be sent
  })
);

// Serve statis files from the public directory
app.use(express.static(path.join(__dirname, "public")));
// use request logger in development mode only
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// parse incoming json and limit the body size
app.use(express.json({ limit: "10kb" }));

// sanitize input to prevent mongodb injection
app.use(mongoSanitize());

// Routes for users
app.use("/api/v1/users", userRouter);

// Routes for posts

// handle all unmatched routes with a 404 error using AppError
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
