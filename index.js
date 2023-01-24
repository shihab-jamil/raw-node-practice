// dependencies
const server = require("./lib/Server.js")
const worker = require("./lib/Worker")

//app module
const app = {}

app.init = () => {
    // start the server
    server.init()
    //start the worker
    worker.init()
}

app.init();

module.exports = app
