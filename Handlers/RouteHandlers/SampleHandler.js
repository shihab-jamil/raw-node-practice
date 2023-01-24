const handler = {}

handler.sampleHandler = (requestProperty, callback) => {
    callback(200, {
        message: "This is a sample response"
    })
}
module.exports = handler