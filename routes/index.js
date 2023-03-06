const usersRoutes = require("./usersRoute");
const postRoutes = require("./postRoute");
const commentRoute = require("./commentRoute");
const hashRoute = require("./hashRoute");

function routes(app) {
  app.use("/api/v1/user", usersRoutes);
  app.use("/api/v1/post", postRoutes);
  app.use("/api/v1/comment", commentRoute);
  app.use("/api/v1/hash", hashRoute);
}
module.exports = routes;
