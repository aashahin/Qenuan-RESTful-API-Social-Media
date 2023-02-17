const {set,connect} = require("mongoose");
exports.dbConnection = ()=>{
    set("strictQuery",false);
    connect(process.env.MONGO_URL).then((connect)=>{
        console.log(`Success connect to database: ${connect.connection.host}`)
    })
}