const dotenv = require("dotenv");
const mongoose = require("mongoose");

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! Shutting down");
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: "./.env" });

const app = require("./app");

const port = process.env.PORT || 3000;

mongoose
  .connect(process.env.DB)
  .then(() => {
    console.log("DB connected succesfully");
  })
  .catch((err) => console.log(err));

const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLE REJECTION! Shutting down");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
