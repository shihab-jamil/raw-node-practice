const fs = require('fs')
const path = require('path')

const lib = {}

lib.basedir = path.join(__dirname, '/../.data/')

lib.create = (dir, file, data, callback) => {
    //opening file for writing
    fs.open(lib.basedir + dir + '/' + file + '.json', 'wx', (error, fileDescriptor) => {
        if (!error && fileDescriptor) {
            // convert data to string
            const stringData = JSON.stringify(data)

            // write data to file and close it
            fs.writeFile(fileDescriptor, stringData, (writeError) => {
                if (!writeError) {
                    fs.close(fileDescriptor, (closeError) => {
                        if (!closeError) {
                            callback(false)
                        } else {
                            callback("Error closing the new file")
                        }
                    })
                } else {
                    callback("Error writing on new file")
                }
            })
        } else {
            callback("Could not create new file it may already exists")
        }
    })
}

lib.read = (dir, file, callback) => {
    fs.readFile(`${lib.basedir + dir}/${file}.json`, 'utf-8', (error, data) => {
        callback(error, data)
    })
}

lib.update = (dir, file, data, callback) => {
    fs.open(`${lib.basedir + dir}/${file}.json`, 'r+', (error, fileDescriptor) => {
        if (!error && fileDescriptor) {
            const stringData = JSON.stringify(data)

            // truncate the file
            fs.ftruncate(fileDescriptor, (truncateError) => {
                if (!truncateError) {
                    // write to the file and close it
                    fs.writeFile(fileDescriptor, stringData, (writeError) => {
                        fs.close(fileDescriptor, (closeError) => {
                            if (!closeError) {
                                callback(false)
                            } else {
                                callback("Error closing file")
                            }
                        })
                    })
                } else {
                    callback('Error truncating file')

                }
            })
        } else {
            callback(`Error updating file, file may not exists`);
        }
    })
}

lib.delete = (dir, file, callback) => {
    // unlinking file 
    fs.unlink(`${lib.basedir + dir}/${file}.json`, (error) => {
        if (!error) {
            callback(false)
        } else {
            callback('Error deleting file')
        }
    })
}

lib.list = (dirname, callback) => {
    fs.readdir(`${lib.basedir + dir}/`, (error, fileNames)=> {
        if (!error && fileNames && fileNames.length > 0) {
            let trimmedFileNames = [];
            fileNames.forEach(item => {
                trimmedFileNames.push(item.replace(".json", ""))
            })
            callback(false , trimmedFileNames);
        }else{
            callback("Error reading directory")
        }
    })
}

module.exports = lib 