const usersRoutes = require("./usersRoute");
const postRoutes = require("./postRoute");
function routes(app) {
  app.use("/api/v1/user", usersRoutes);
  app.use("/api/v1/post", postRoutes);
}
module.exports = routes;
