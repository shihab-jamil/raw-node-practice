//dependencies
const data = require('../../lib/data')
const { hash, parseJSON } = require('../../Helpers/Utilities')
const {cloneDeep} = require("lodash");
const tokenHandler = require('../RouteHandlers/TokenHandler')

const handler = {}

handler.userHandler = (requestProperty, callback) => {
    const acceptedMethods = ["get", "post", "put", "delete"];
    if(acceptedMethods.includes(requestProperty.method)){
        handler._users[requestProperty.method](requestProperty, callback)
    }else{
        callback(405, {
            message: "Method not allowed"
        })
    }

}

handler._users = {}

handler._users.get = (requestProperty, callback) => {
    //check the phone number is valid
    const phone = (typeof (requestProperty.queryStringObjects.phone) === 'string'
        && requestProperty.queryStringObjects.phone.trim().length === 11) ? requestProperty.queryStringObjects.phone : null;

    if(phone){
        let token = typeof (requestProperty.headerObject.token === 'string')
        ? requestProperty.headerObject.token : null;

        tokenHandler._tokens.verify(token, phone, (tokenId) => {
            if(tokenId){
                //lookup the user
                data.read('users', phone, (error, userData) => {
                    const user = cloneDeep(parseJSON(userData))
                    if(error){
                        callback(404, {
                            error : "Requested User was not found"
                        })
                    }else{
                        delete user.password
                        callback(200, user)
                    }
                })
            }else{
                callback(403, {
                    error : "Unauthenticated"
                })
            }
        })
    }else{
        callback(404, {
            error : "Requested User was not found"
        })
    }
}

handler._users.post = (requestProperty, callback) => {
    const firstName = (typeof (requestProperty.body.firstname) === 'string'
        && requestProperty.body.firstname.trim().length > 0) ? requestProperty.body.firstname : null;

    const lastName = (typeof (requestProperty.body.lastname) === 'string'
        && requestProperty.body.lastname.trim().length > 0) ? requestProperty.body.lastname : null;

    const phone = (typeof (requestProperty.body.phone) === 'string'
        && requestProperty.body.phone.trim().length === 11) ? requestProperty.body.phone : null;

    const password = (typeof (requestProperty.body.password) === 'string'
        && requestProperty.body.password.trim().length > 0) ? requestProperty.body.password : null;

    const tosAgreement = (typeof (requestProperty.body.tosAgreement) === 'boolean'
        && requestProperty.body.tosAgreement) ? requestProperty.body.tosAgreement : null;

    if(firstName && lastName && phone && password && tosAgreement){
        //making sure if user is already existed or not
        data.read('users', phone , (readError, user) => {
            if(readError){
                let userObject = {
                    firstName,
                    lastName,
                    phone,
                    password : hash(password),
                    tosAgreement
                }
                //store user to db
                data.create('users', phone, userObject, (createError) => {
                    if(!createError){
                        callback(200, {
                            message : "User created successfully"
                        })
                    }else{
                        callback(500, {
                            error : "Could not create user"
                        })
                    }
                })
            }else{
                callback(500, {
                    error : "There was a problem in server side"
                })
            }
        })
    }else{
        callback(400, {
            error : "You have problem with payload"
        })
    }


}

//TODO authentication
handler._users.put = (requestProperty, callback) => {
    //check the phone number is valid
    const firstName = (typeof (requestProperty.body.firstname) === 'string'
        && requestProperty.body.firstname.trim().length > 0) ? requestProperty.body.firstname : null;

    const lastName = (typeof (requestProperty.body.lastname) === 'string'
        && requestProperty.body.lastname.trim().length > 0) ? requestProperty.body.lastname : null;

    const phone = (typeof (requestProperty.body.phone) === 'string'
        && requestProperty.body.phone.trim().length === 11) ? requestProperty.body.phone : null;

    const password = (typeof (requestProperty.body.password) === 'string'
        && requestProperty.body.password.trim().length > 0) ? requestProperty.body.password : null;


    if(firstName || lastName || password){
        let token = typeof (requestProperty.headerObject.token === 'string')
            ? requestProperty.headerObject.token : null;

        tokenHandler._tokens.verify(token, phone, (tokenId) => {
            if(tokenId){
                //store user to db
                data.read('users', phone, (readError, userData) => {
                    if(readError){
                        callback(200, {
                            message : "user not found"
                        })
                    }else{
                        let payload = cloneDeep(parseJSON(userData))
                        if(firstName){
                            payload.firstName = firstName;
                        }
                        if(lastName){
                            payload.lastName = lastName;
                        }
                        if(password){
                            payload.password = hash(password)
                        }

                        data.update('users', phone, payload , (updateError, data) => {
                            if(updateError){
                                callback(404, {
                                    error : updateError
                                })
                            }else{
                                callback(200, {
                                    message : "user updated successfully"
                                })
                            }
                        })
                    }
                })
            }else{
                callback(403, {
                    error : "Unauthenticated"
                })
            }
        })
    }else{
        callback(400, {
            error : "You have problem with payload"
        })
    }
}

//TODO authentication
handler._users.delete = (requestProperty, callback) => {
    const phone = (typeof (requestProperty.queryStringObjects.phone) === 'string'
        && requestProperty.queryStringObjects.phone.trim().length === 11) ? requestProperty.queryStringObjects.phone : null;
    if(phone){
        let token = typeof (requestProperty.headerObject.token === 'string')
            ? requestProperty.headerObject.token : null;

        tokenHandler._tokens.verify(token, phone, (tokenId) => {
            if(tokenId){
                data.read('users', phone, (readError, userData) => {
                    if(readError){
                        callback(500, {
                            error : "There is server side error or data not found",
                            log : readError
                        })
                    }else{
                        data.delete('users', phone, (deleteError) => {
                            if(deleteError){
                                callback(500, {
                                    error : "There is server side error deleting user"
                                })
                            }else{
                                callback(200, {
                                    message : "User deleted successfully"
                                })
                            }
                        })
                    }
                })
            }else{
                callback(403, {
                    error : "Unauthenticated"
                })
            }
        })
    }else{
        callback(404, {
            error : "Invalid phone number"
        })
    }
}

module.exports = handler