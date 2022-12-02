// dependencies
const http = require('http')
const url = require('url')


//app module
const app = {}

// configuration
app.config =  {
    port : 3000
}

//creating server
app.createServer = () => {
    const server = http.createServer(app.handleReqRes)
    server.listen(app.config.port, ()=> {
        console.log(`Listening to port ${app.config.port}`);
    })
}

//handle request response
app.handleReqRes = (req, res) => {
    // parsing the url
    // const parsedUrl = url.parse(req.url, true)
    // console.log(parsedUrl)
    res.end('Hello world')
}

// starting the server
app.createServer()