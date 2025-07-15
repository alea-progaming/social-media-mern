const dotenv = require("dotenv");
const mongoose = require("mongoose");
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
