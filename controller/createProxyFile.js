const fs = require("fs");

const createProxyFile = async (filePath = "proxy.txt", proxy) => {
    fs.writeFile(filePath, proxy, (err) => {
        if (err) {
            console.log(err)
        } else {
            console.log("Proxy file created successfully")
        }
    })
}

module.exports = createProxyFile;
