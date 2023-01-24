// dependencies
const https = require("https")
const environment = require("../Helpers/environments")
const querystring = require("querystring");


const notifications = {}

// send notification to user using twilio api

notifications.sendTwilioSms = (phone, message , callback) => {
    // input validation
    const userPhone = typeof phone === 'string' && phone.trim().length === 11 ? phone.trim() : false;
    const userMessage = typeof message === 'string' && message.trim().length <= 1600 ? message.trim() : false;

    if(userPhone && userMessage){
    //      configure the request payload
        const payload = {
            from : environment.twilio.fromPhone,
            to : `+88${userPhone}`,
            body : userMessage
        }

        //stringify the payload
        const stringyFyPayload = querystring.stringify(payload)

        // configure the https request details
        const requestDetails = {
            hostname : "api.twilio.com",
            method : "POST",
            path : `/2010-04-01/Accounts/${environment.twilio.accountSid}/Messages.json`,
            auth : `${environment.twilio.accountSid}:${environment.twilio.authToken}`,
            headers : {
                'Content-Type' : 'application/x-www-form-urlencoded'
            }
        }

        // instantiate request object
        const req = https.request(requestDetails, (res) => {
            // get the status of sent
            const status = res.statusCode;
            // calllback successfully if request went through
            if(status === 200 || status === 201){
                callback(false)
            }else{
                callback(`Status code returned was ${status}`)
            }
        })

        req.on("error", error => {
            callback(error)
        })
        req.write(stringyFyPayload);
        req.end()

    }else{
        callback("Given parameter were missing or invalid")
    }
}

module.exports = notifications