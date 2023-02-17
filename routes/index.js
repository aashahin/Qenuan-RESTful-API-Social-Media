const usersRoutes = require("./usersRoute");
function routes(app) {
    app.use("/api/v1/user",usersRoutes)
}
module.exports = routes;