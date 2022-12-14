// dependencies
const http = require('http')

const { handleReqRes } = require('./Helpers/HandleReqRes')
const environments = require('./Helpers/environments')
const data = require('./lib/data')
//app module
const app = {}

// testing file system write
data.create('test', 'newFile', { 'name': 'Bangladesh', 'language': 'Bangla' }, (error) => {
    console.log(`Error was ${error}`)
})

// testing file read
data.read('test', 'newFile', (error, data) => {
    console.log(error, data)
})

// testing file update
data.update('test', 'newFile', { 'name': 'England', 'language': 'English' }, (error) => {
    console.log(error)
})

// testing file delete
data.delete('test', 'newFile', (error) => {
    console.log(error)
})

//creating server
app.createServer = () => {
    const server = http.createServer(app.handleReqRes)
    server.listen(environments.port, () => {
        console.log(`Listening to port ${environments.port}`);
    })
}
//handle request response
app.handleReqRes = handleReqRes


// starting the server
app.createServer()