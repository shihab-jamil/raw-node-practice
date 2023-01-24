//dependencies
const data = require('../../lib/data')
const { hash, parseJSON, createRandomString } = require('../../Helpers/Utilities')
const {cloneDeep} = require("lodash");

const handler = {}

handler.tokenHandler = (requestProperty, callback) => {
    const acceptedMethods = ["get", "post", "put", "delete"];
    if(acceptedMethods.includes(requestProperty.method)){
        handler._tokens[requestProperty.method](requestProperty, callback)
    }else{
        callback(405, {
            message: "Method not allowed"
        })
    }

}

handler._tokens = {}

handler._tokens.get = (requestProperty, callback) => {
//check the tokenId is valid
    const id = (typeof (requestProperty.queryStringObjects.id) === 'string'
        && requestProperty.queryStringObjects.id.trim().length === 20) ? requestProperty.queryStringObjects.id : null;

    if(id){
        //lookup the token
        data.read('tokens', id, (error, tokenData) => {
            const token = cloneDeep(parseJSON(tokenData))
            if(error){
                callback(404, {
                    error : "Requested token was not found"
                })
            }else{
                callback(200, token)
            }
        })
    }else{
        callback(404, {
            error : "Requested User was not found"
        })
    }
}

handler._tokens.post = (requestProperty, callback) => {
    const phone = (typeof (requestProperty.body.phone) === 'string'
        && requestProperty.body.phone.trim().length === 11) ? requestProperty.body.phone : null;

    const password = (typeof (requestProperty.body.password) === 'string'
        && requestProperty.body.password.trim().length > 0) ? requestProperty.body.password : null;

    if(phone && password){
        data.read('users', phone, (readError, userData) => {
            if(readError){
                callback(404, {
                    error : "User not found"
                })
            }else{
                let parsedData = parseJSON(userData)
                let hashedPassword = hash(password)
                if(parsedData.password === hashedPassword){
                    let tokenId = createRandomString(20);
                    let expiresAt = Date.now() + 60 * 60 * 1000;
                    let tokenObject = {
                        phone,
                        tokenId,
                        expiresAt
                    }
                    //store the token
                    data.create('tokens', tokenId, tokenObject, (createError, tokenData) => {
                        if(createError){
                            callback(500, {
                                error : "Token create problem"
                            })
                        }else{
                            callback(200, tokenObject)
                        }
                    })
                }else{
                    callback(400, {
                        error : "Password is not valid"
                    })
                }
            }
        })
    }else{
        callback(400, {
            error : "You have a problem in your request"
        })
    }
}

handler._tokens.put = (requestProperty, callback) => {
    const id = (typeof (requestProperty.body.id) === 'string'
        && requestProperty.body.id.trim().length === 20) ? requestProperty.body.id : null;

    const shouldExtend = (typeof (requestProperty.body.shouldExtend) === 'boolean'
        && requestProperty.body.shouldExtend === true);

    if(id && shouldExtend){
        //lookup the token
        data.read('tokens', id, (error, tokenData) => {
            const token = cloneDeep(parseJSON(tokenData))
            if(error){
                callback(404, {
                    error : "Requested token was not found"
                })
            }else{
                if(token.expiresAt > Date.now()){
                    token.expiresAt = Date.now() + 60 * 60 * 1000;
                    data.update('tokens', id, token, (updateError, updateData) => {
                        if(updateData){
                            callback(500, {
                                message : "There is server side error"
                            })
                        }else{
                            callback(200, {
                                message : "token extended"
                            })
                        }
                    })
                }else{
                    callback(400, {
                        error : "Token already expired!"
                    })
                }

            }
        })
    }else{
        callback(404, {
            error : "Requested token was not found"
        })
    }

}

//TODO authentication
handler._tokens.delete = (requestProperty, callback) => {
    const id = (typeof (requestProperty.queryStringObjects.id) === 'string'
        && requestProperty.queryStringObjects.id.trim().length === 20)
        ? requestProperty.queryStringObjects.id : null;

    if(id){
        data.read('tokens', id, (readError, tokenData) => {
            if(readError){
                callback(500, {
                    error : "There is server side error or data not found",
                    log : readError
                })
            }else{
                data.delete('tokens', id, (deleteError) => {
                    if(deleteError){
                        callback(500, {
                            error : "There is server side error deleting token"
                        })
                    }else{
                        callback(200, {
                            message : "Token deleted successfully"
                        })
                    }
                })
            }
        })

    }else{
        callback(404, {
            error : "Invalid Token Id"
        })
    }
}

handler._tokens.verify = (id, phone, callback) => {
    data.read('tokens', id, (readError, tokenData) => {
        if(readError){
            callback(false);
        }else{
            let token = parseJSON(tokenData);
            if(token.phone === phone && token.expiresAt > Date.now()){
                callback(true)
            }else{
                callback(false)
            }
        }
    })
}

module.exports = handler