const getAproxy = require("./getAproxy");

const processInBatches = async (data, batchSize, scrap, successDataMap, errorDataMap) => {
    for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        
        const results = await Promise.all(batch.map(async (item) => {
            if(!item.user || !item.password) {
                return
            }
            const proxy = await getAproxy()
            console.log(item.user, item.password, proxy)

            return await scrap(item.user, item.password, item.code_2fa, proxy)
        }));

        batch.forEach((item, idx) => {
            const result = results[idx]
            if (result) {
                successDataMap.set(item.user, result)
            } else {
                errorDataMap.set(item.user, result)
            }
        })
    }
}

module.exports = processInBatches;
