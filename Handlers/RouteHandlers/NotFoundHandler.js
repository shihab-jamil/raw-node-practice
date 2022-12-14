const handler = {}

handler.notFoundHandler = (requestProperty, callback) => {
    callback(404, {
        message: "Your requested url was not found"
    })
}
module.exports = handler