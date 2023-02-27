// Libraries
require("dotenv").config({ path: ".env" });
const express = require("express"),
  app = express(),
  morgan = require("morgan"),
  compression = require("compression");

const { dbConnection } = require("./config/dbConnection");
const routes = require("./routes");
const { globalErrors } = require("./middlewares/Errors/globalErorr");

// DB
dbConnection();
// Morgan
if (process.env.NODE_MODE === "development") {
  app.use(morgan("dev"));
  console.log(`Application Mode: ${process.env.NODE_MODE}`);
}

// Middleware
app.use(compression());

app.use(express.json());

// Routes
routes(app);
app.all("*", (req, res, next) => {
  next(new ErrorHandler(`Can't Find This Route: ${req.originalUrl}`, 404));
});
app.use(globalErrors);

// Run Server
const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`Running Server With ${PORT}`);
});

// Unhandled Rejection Outside Express
process.on("unhandledRejection", (err) => {
  console.log(`Unhandled Rejection Error ${err}`);
  server.close(() => {
    console.log(`Shutdown The Server.`);
    process.exit(1);
  });
});
