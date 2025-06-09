const fs = require("fs");

const deleteProxyFile = async (filePath = "proxy.txt") => {
    if(fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.log(err)
            } else {
                console.log("Proxy file deleted successfully")
            }
        })
    } else {
        console.log("Proxy file does not exist")
    }
}

module.exports = deleteProxyFile;
