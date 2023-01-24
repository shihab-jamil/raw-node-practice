const environments = {}

environments.common = {
    secretKey : 'sadjkajhsdkjhakdh',
    maxChecks : 5,
    twilio : {
        fromPhone : '+15739283046',
        accountSid : 'AC421ee5223eb3c691d7f6eee5ff8aa681',
        authToken : 'd2e972d202c3fd44f68ba05789dc4e31'
    }
}

environments.staging = {
    ...environments.common,
    port: 3000,
    envName: 'staging',
}

environments.production = {
    ...environments.common,
    port: 5000,
    envName: 'production',
}

const currentEnvironment = typeof (process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV : 'staging'

const environmentToExport = typeof (environments[currentEnvironment]) === 'object' ? environments[currentEnvironment] : environments.staging

module.exports = environmentToExport