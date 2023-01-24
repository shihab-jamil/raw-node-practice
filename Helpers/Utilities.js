//dependencies
const crypto = require('crypto')
const environments = require('../Helpers/environments')

const utilities = {}

//parse json string to object
utilities.parseJSON = (jsonString) => {
    let output = {}
    try{
        output = JSON.parse(jsonString)
    }catch {
        output = {}
    }
    return output
}

utilities.hash = (str) => {
    if(typeof (str) === 'string' && str.length > 0){
        return crypto.createHmac('sha256', environments.secretKey )
            .update(str)
            .digest('hex')
    }else{
        return false;
    }
}


utilities.createRandomString = (stringLength) => {
    if(typeof (stringLength) === 'number' && stringLength > 0){
        let possibleCharacters = "abcdefghijklmnopqrstuvwxyz1234567890"
        let output = ""
        for (let i = 0; i < stringLength; i++) {
            output += possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length))
        }
        return output
    }else{
        return false;
    }
}

module.exports = utilities