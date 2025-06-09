const XLSX = require("xlsx")

const readExcelFile = async (file) => {
    const workbook = XLSX.readFile(file)
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })

    const data = rows.slice(1).map(row => ({
        user: row[0],
        password: row[1],
        code_2fa: row[2],
    }))

    return data
}

module.exports = readExcelFile
