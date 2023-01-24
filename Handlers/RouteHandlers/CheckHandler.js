// dependencies
const {cloneDeep} = require("lodash");
const data = require("../../lib/data");
const { parseJSON, createRandomString} = require("../../Helpers/Utilities");
const tokenHandler = require("../RouteHandlers/TokenHandler");
const environment = require("../../Helpers/environments");

const handler = {};

handler.checkHandler = (requestProperty, callback) => {
  const acceptedMethods = ["get", "post", "put", "delete"];
  if(acceptedMethods.includes(requestProperty.method)){
        handler._checks[requestProperty.method](requestProperty, callback)
    }else {
        callback(405, {
            message: "Method not allowed",
        });
    }

}

handler._checks = {}

handler._checks.get = (requestProperty, callback) => {
    const id = (typeof (requestProperty.queryStringObjects.id) === 'string'
        && requestProperty.queryStringObjects.id.trim().length === 20)
        ? requestProperty.queryStringObjects.id : null;

    if(id){
        //lookup the token
        data.read('checks', id, (error, checksData) => {
            const checksObjects = cloneDeep(parseJSON(checksData))
            if(error){
                callback(404, {
                    error : "Requested token was not found"
                })
            }else{
                let token = typeof (requestProperty.headerObject.token === 'string')
                    ? requestProperty.headerObject.token : false;
                tokenHandler._tokens.verify(token, checksObjects.userPhone, (isTokenValid, dump) => {
                    if(isTokenValid){
                        callback(200, {checksObjects})
                    }else{
                        callback(403, {
                            error : "Unauthorized"
                        })
                    }
                })
            }
        })
    }else{
        callback(404, {
            error : "Requested User was not found"
        })
    }
}

handler._checks.post = (requestProperty, callback) => {
    let protocol = typeof (requestProperty.body.protocol) === 'string'
    && ["http", "https"].includes(requestProperty.body.protocol) ? requestProperty.body.protocol : false;

    let url = typeof (requestProperty.body.url) === 'string'
    && requestProperty.body.url.trim().length > 0 ? requestProperty.body.url : false;

    let method = typeof (requestProperty.body.method) === 'string'
    && ["get", "put", "post", "delete"].includes(requestProperty.body.method.toLowerCase())
        ? requestProperty.body.method : false;

    let successCodes = typeof (requestProperty.body.successCodes) === 'object'
        && requestProperty.body.successCodes instanceof Array ? requestProperty.body.url : false;

    let timeoutSeconds = typeof (requestProperty.body.timeoutSeconds) === 'number'
    && requestProperty.body.timeoutSeconds % 1 === 0 &&  requestProperty.body.timeoutSeconds >= 1
    &&  requestProperty.body.timeoutSeconds <= 5 ? requestProperty.body.timeoutSeconds : false;

    if(protocol && url && method && successCodes && timeoutSeconds){
        let token = typeof (requestProperty.headerObject.token === 'string')
            ? requestProperty.headerObject.token : false;

        data.read('tokens', token, (readError, tokenData) => {
            if(readError){
                callback(403, {
                    error : "Unauthorized"
                })
            }else{
                let userPhone = parseJSON(tokenData).phone
                //lookup user data
                data.read('users', userPhone, (error, userData) => {
                    if(error){
                        callback(404, {
                            error : "User not found"
                        })
                    }else{
                        tokenHandler._tokens.verify(token, userPhone, (isTokenValid, dump) => {
                            if(isTokenValid){
                                let userObject = parseJSON(userData)
                                let userChecks = typeof userObject.checks === 'object' && userObject.checks instanceof Array
                                ? userObject.checks : [];

                                if(userChecks.length <= environment.maxChecks){
                                    let checkId = createRandomString(20);
                                    let checkObject = {
                                        id : checkId,
                                        userPhone : userPhone,
                                        protocol,
                                        url,
                                        method,
                                        successCodes,
                                        timeoutSeconds
                                    }
                                    data.create("checks", checkId, checkObject, (createError, createData) => {
                                        if(createError){
                                            callback(500, {
                                                error : "Server side error"
                                            })
                                        }else{
                                            userObject.checks = userChecks
                                            userObject.checks.push(checkId)

                                            data.update('users', userPhone, userObject, (updateError, user) => {
                                                if(updateError){
                                                    callback(500, {
                                                        error : "Server side error",
                                                    })
                                                }else{
                                                    callback(200, {
                                                        checkObject
                                                    })
                                                }
                                            })
                                        }
                                    })
                                }else{
                                    callback(401,{
                                        error : "User has reached max limit"
                                    })
                                }
                            }else{
                                callback(403, {
                                    error : "Unauthorized"
                                })
                            }
                        })
                    }
                })
            }
        })
    }else{
        callback(400, {
            error : "You have a problem in your request"
        })
    }
}

handler._checks.put = (requestProperty, callback) => {
    const id = (typeof (requestProperty.body.id) === 'string'
        && requestProperty.body.id.trim().length === 20)
        ? requestProperty.body.id : false;

    let protocol = typeof (requestProperty.body.protocol) === 'string'
    && ["http", "https"].includes(requestProperty.body.protocol) ? requestProperty.body.protocol : false;

    let url = typeof (requestProperty.body.url) === 'string'
    && requestProperty.body.url.trim().length > 0 ? requestProperty.body.url : false;

    let method = typeof (requestProperty.body.method) === 'string'
    && ["get", "put", "post", "delete"].includes(requestProperty.body.method.toLowerCase())
        ? requestProperty.body.method : false;

    let successCodes = typeof (requestProperty.body.successCodes) === 'object'
    && requestProperty.body.successCodes instanceof Array ? requestProperty.body.url : false;

    let timeoutSeconds = typeof (requestProperty.body.timeoutSeconds) === 'number'
    && requestProperty.body.timeoutSeconds % 1 === 0 &&  requestProperty.body.timeoutSeconds >= 1
    &&  requestProperty.body.timeoutSeconds <= 5 ? requestProperty.body.timeoutSeconds : false;

    if(id){
        if(protocol || method || url || successCodes || timeoutSeconds){
            data.read('checks', id, (readError, checkData) => {
                if(readError){
                    callback(500, {
                        error : "Server side error reading token"
                    })
                }else{
                    let checkObject = parseJSON(checkData);
                    let token = typeof (requestProperty.headerObject.token === 'string')
                        ? requestProperty.headerObject.token : false;
                    tokenHandler._tokens.verify(token, checkObject.userPhone, (isTokenValid, dump) => {
                        if(isTokenValid){
                            if(protocol){
                                checkObject.protocol = protocol
                            }
                            if(method){
                                checkObject.method = method
                            }
                            if(url){
                                checkObject.url = url
                            }
                            if(successCodes){
                                checkObject.successCodes = successCodes
                            }
                            if(timeoutSeconds){
                                checkObject.timeoutSeconds = timeoutSeconds
                            }

                            data.update("checks", id, checkObject, (updateError, dump) => {
                                if(updateError){
                                    callback(500, {
                                        error : "Server side error"
                                    })
                                }else{
                                    callback(200)
                                }
                            })
                        }else{
                            callback(403, {
                                error : "Unauthorized"
                            })
                        }
                    })
                }
            })
        }else{
            callback(400, {
                error : "At leas need one data to update"
            })
        }
    }else{
        callback(500, {
            error : "Server side error for validation"
        })
    }
}

handler._checks.delete = (requestProperty, callback) => {
    const id = typeof requestProperty.queryStringObjects.id === 'string'
        && requestProperty.queryStringObjects.id.trim().length === 20
        ? requestProperty.queryStringObjects.id : false;

    if(id){
        //lookup the checks
        data.read('checks', id, (error, checksData) => {
            const checksObjects = cloneDeep(parseJSON(checksData))
            if(error){
                callback(404, {
                    error : "Requested token was not found"
                })
            }else{
                let token = typeof (requestProperty.headerObject.token === 'string')
                    ? requestProperty.headerObject.token : false;
                tokenHandler._tokens.verify(token, checksObjects.userPhone, (isTokenValid, dump) => {
                    if(isTokenValid){
                        data.delete('checks', id, (deleteError) => {
                            if(deleteError){
                                callback(500, {
                                    error : "There is server side error deleting checks",
                                })
                            }else{
                                data.read("users",
                                    parseJSON(checksData).userPhone,
                                    (readError, userData) => {
                                        if (readError) {
                                            callback(500, {
                                                error: "Server error",
                                            })
                                        } else {
                                            let userObject = parseJSON(userData)
                                            let userChecks = typeof userObject.checks === 'object' && userObject.checks instanceof Array
                                                ? userObject.checks : [];

                                            if (userChecks.indexOf(id) > -1) {
                                                userChecks.splice(userChecks.indexOf(id), 1);
                                                userObject.checks = userChecks;
                                            } else {
                                                callback(500, {
                                                    error: "Server error checks not found in user object",
                                                })
                                            }

                                            data.update("users", userObject.phone, userObject, (updateError, dump) => {
                                                if (updateError) {
                                                    callback(500, {
                                                        error: "Server error",
                                                    })
                                                } else {
                                                    callback(200)
                                                }
                                            })
                                        }
                                    })
                            }
                        })


                    }else{
                        callback(403, {
                            error : "Unauthorized",
                        })
                    }
                })
            }
       })
    }else{
        callback(404, {
            error : "Requested check was not found",
        })
    }
}

module.exports = handler