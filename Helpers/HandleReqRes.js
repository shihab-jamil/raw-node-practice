
const url = require('url')
const { StringDecoder } = require('string_decoder')
const routes = require('../routes')
const { notFoundHandler } = require('../Handlers/RouteHandlers/NotFoundHandler')
const { parseJSON } = require('./Utilities')

const handler = {}

handler.handleReqRes = (req, res) => {
    // parsing the url
    const parsedUrl = url.parse(req.url, true)
    const path = parsedUrl.pathname
    const trimmedPath = path.replace(/^\/+|\/+$/g, '')
    const method = req.method.toLowerCase()
    const queryStringObjects = parsedUrl.query
    const headerObject = req.headers

    const requestProperty = {
        parsedUrl,
        path,
        trimmedPath,
        method,
        queryStringObjects,
        headerObject
    }

    const chosenHandler = routes[trimmedPath] ?? notFoundHandler

    const decoder = new StringDecoder('utf8')
    let realData = '';


    req.on('data', buffer => {
        realData += decoder.write(buffer)
    })
    req.on('end', () => {
        realData += decoder.end()
        requestProperty.body = parseJSON(realData)

        chosenHandler(requestProperty, (statusCode, payload) => {
            statusCode = typeof (statusCode) === 'number' ? statusCode : 500
            payload = typeof (payload) === 'object' ? payload : {}
            const payloadString = JSON.stringify(payload)

            res.setHeader('Content-Type', 'application/json')
            res.writeHead(statusCode)
            res.end(payloadString)
        })
    })

}


module.exports = handler