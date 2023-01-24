// dependencies
const http = require('http')
const { handleReqRes } = require('../Helpers/HandleReqRes')
const environments = require('../Helpers/environments')
const { sendTwilioSms } = require("../Helpers/Notifications")
//app module
const server = {}

// sendTwilioSms("01706822418", "Hello world", error => {
//     console.log(`This is the error ${error}`)
// })

//creating server
server.createServer = () => {
    const createServerVariable = http.createServer(server.handleReqRes)
    createServerVariable.listen(environments.port, () => {
        console.log(`Listening to port ${environments.port}`);
    })
}
//handle request response
server.handleReqRes = handleReqRes

// starting the server
server.init = () => {
    server.createServer()
}

module.exports = server