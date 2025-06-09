const fs = require("fs").promises;

const getAproxy = async (filePath = "proxy.txt") => {
    try {
        const data = await fs.readFile(filePath, "utf-8");
        const lines = data.split("\n").filter(Boolean);

        if (lines.length === 0) {
            console.log("No proxies found");
            return null;
        }

        const proxyToUse = lines[0];
        const remainingProxies = lines.slice(1);

        console.log("proxyToUse", proxyToUse);

        await fs.writeFile(filePath, remainingProxies.join("\n"));

        return proxyToUse;
    } catch (err) {
        console.log(err);
        return null;
    }
};

module.exports = getAproxy;
