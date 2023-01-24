const {sampleHandler} = require("./Handlers/RouteHandlers/SampleHandler")
const {userHandler} = require("./Handlers/RouteHandlers/UserHandler")
const {tokenHandler} = require("./Handlers/RouteHandlers/TokenHandler")
const {checkHandler} = require("./Handlers/RouteHandlers/CheckHandler")

const routes = {
    sample : sampleHandler,
    user : userHandler,
    token : tokenHandler,
    check : checkHandler

}

module.exports = routes