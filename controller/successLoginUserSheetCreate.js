const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const successLoginUserSheetCreate = async(id, password, code_2fa) => {
    try {
        // Create output directory if it doesn't exist
        const outputDir = path.join(__dirname, '..', 'output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }
        
        // Generate filename with current date (YYYY-MM-DD format)
        const currentDate = new Date().toISOString().split('T')[0];
        const outputPath = path.join(outputDir, `successful_logins_${currentDate}.xlsx`);
        
        let workbook;
        let data;
        
        // Check if file already exists
        if (fs.existsSync(outputPath)) {
            // Read existing workbook
            workbook = XLSX.readFile(outputPath);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            
            // Convert existing sheet to array of arrays
            const existingData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            
            // Add new row to existing data
            existingData.push([id, password, code_2fa]);
            data = existingData;
        } else {
            // Create new workbook and data
            workbook = XLSX.utils.book_new();
            data = [
                ['ID', 'Password', '2FA Code'], // Headers
                [id, password, code_2fa] // First data row
            ];
        }
        
        // Create/update worksheet with data
        const worksheet = XLSX.utils.aoa_to_sheet(data);
        
        // Remove existing sheet if it exists and add the updated one
        if (workbook.SheetNames.length > 0) {
            workbook.SheetNames = [];
            workbook.Sheets = {};
        }
        
        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Successful Logins');
        
        // Write the workbook to file
        XLSX.writeFile(workbook, outputPath);
        
        return outputPath;
    } catch (error) {
        console.error('Error creating/updating Excel sheet:', error);
        throw error;
    }
}

module.exports = successLoginUserSheetCreate