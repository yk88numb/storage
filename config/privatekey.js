const config = require("config")
require("dotenv").config()

module.exports = function () {
    if (!config.get("jwtPrivateKey1")) {
        console.log("Fattal error:Jwt private key 1 not defined")
        process.exit(1)
    }

    if (!config.get("jwtPrivateKey2")) {
        console.log("Fattal error:Jwt private key 2 not defined")
        process.exit(1)
    }
}