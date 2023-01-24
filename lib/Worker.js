// dependencies
const data = require("./data")
const {parseJSON} = require("../Helpers/Utilities")
const url = require("url");
const http = require("http");
const https = require("https");

//app module
const worker = {}

worker.processOutcome = (checkData, flag) => {

}

worker.performCheck = (checkData) => {
    let checkOutcome = {
        error : false,
        responseCode : false,
    }

    let outcomeSend = false;
    // parse the url
    const parsedUrl = url.parse(checkData.protocol+"://"+checkData.url, true);
    const hostname = parsedUrl.hostname;
    const path = parsedUrl.path;

    // construct the request
    const requestDetails = {
        protocol : checkData.protocol + ":",
        hostname : hostname,
        method : checkData.method.toUpperCase(),
        path : path,
        timeout : checkData.timeoutSeconds * 1000
    }

    const protocolToUse = checkData.protocol === 'http' ? http : https;

    let req = protocolToUse.request(requestDetails, (res) => {
        if(!outcomeSend){
            worker.processOutcome(checkData, checkOutcome)
            outcomeSend = true;
        }
    })

    req.on("error", error => {
        checkOutcome = {
            error : true,
            value : error,
        }
        if(!outcomeSend){
            worker.processOutcome(checkData, checkOutcome)
            outcomeSend = true;
        }
    })
    req.on("timeout", () => {
        checkOutcome = {
            error : true,
            value : "Timeout Error",
        }
        if(!outcomeSend){
            worker.processOutcome(checkData, checkOutcome)
            outcomeSend = true;
        }
    })
}

worker.validateCheckData = (checkData) => {
    if(checkData && checkData.id){
        checkData.state = typeof checkData.state === 'string'
        && ["up", "down"].includes(checkData.state)
        ? checkData.state : "down";

        checkData.lastChecked = typeof checkData.lastChecked === 'number'
            && checkData.lastChecked > 0 ? checkData.lastChecked : false;

        worker.performCheck(checkData)
    }else{
        console.log("Invalid format")
    }
}


worker.gatherAllChecks = () => {
    // get all the checks
    data.list("checks", (error, checks) => {
        if(!error && checks && checks.length > 0){
            checks.forEach(item => {
                // read the check data
                data.read("checks", item, (readError, checkData) => {
                    if(!readError && checkData){
                        // pass the data to the next process
                        worker.validateCheckData(parseJSON(checkData))
                    }else{
                        console.log("Error : reading checks data")
                    }
                })
            })
        }else{
            console.log("Error : Could not find any check to process")
        }
    })
}

worker.loop = () => {
    setInterval(() => {
        worker.gatherAllChecks()
    }, 1000 * 60)
}

// starting the worker
worker.init = () => {
    // execute all the checks
    worker.gatherAllChecks();

    // call the loop so that checks continue
    worker.loop()
}

module.exports = worker