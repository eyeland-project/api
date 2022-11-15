module.exports = function(environment = "development") {
    return {
        session: require("./session-config")(environment),
        database_conf: require("./database-config"),
    }
};