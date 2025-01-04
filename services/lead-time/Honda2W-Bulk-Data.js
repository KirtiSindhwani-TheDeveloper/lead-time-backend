const connection = require('../../connection');
const sql=require('mssql2')
const moment = require("moment");
module.exports = {
  bulkInsertData: async function(pool,dealer,location) {

    const values = data.map(item => {
      const Dealer = dealer || item["dealer"];  // Use provided dealer or item["dealer"]
      const Location = location || item["location"]; 
    
       return [ item["order number"], // Order Number
        item['supplier name'], // Supplier Name
        item['order status'], // Order Status (Converted to lowercase)
        item['purchase order type'], // Purchase Order Type (Converted to lowercase)
        item['part number'], // Part Number (Converted to lowercase)
        item['quantity requested'] !== null && !isNaN(parseFloat(item['quantity requested'])) ? parseFloat(item['quantity requested']) : null, // Quantity Requested (Converted to lowercase)
        item['mrns actual received qty'] !== null && !isNaN(parseFloat(item['mrns actual received qty'])) ? parseFloat(item['mrns actual received qty']) : null, // MRNs Actual Received Quantity (Converted to lowercase)
        item['invoiced qty'] !== null && !isNaN(parseFloat(item['invoiced qty'])) ? parseFloat(item['invoiced qty']) : null, // Invoiced Quantity (Converted to lowercase)
        item['order date'] !== "0-00-00" ? convertExcelSerialToIST(parseFloat(item['order date'])) : null, // Order Date (Converted to lowercase)
        item['mrn date'] !== "0-00-00" ? convertExcelSerialToIST(parseFloat(item['mrn date'])) : null, // MRN Date (Converted to lowercase)
        item['invoice date po'] !== "0-00-00" ? convertExcelSerialToIST(parseFloat(item['invoice date po'])) : null, // Invoice Date PO (Converted to lowercase)
        item['network code'], // Network Code (Converted to lowercase)
        item['brand'], // Brand (Converted to lowercase)
        item['dealer'], // Dealer (Converted to lowercase)
        item['location'], // Location (Converted to lowercase)
        item['brandid'], // Brand ID (Converted to lowercase)
        Dealer, // Dealer ID (Converted to lowercase)
        Location // Location ID (Converted to lowercase)
    ]}
  );
    
    const table = new sql.Table('Honda_2W_purchase_register_File_Lead_Time_latest_data');
    table.create = false;
    
    // Updated columns with new names and data types
    table.columns.add('Order Number', sql.VarChar(50), { nullable: true }); // VarChar(50) for Order Number
    table.columns.add('Supplier Name', sql.VarChar(50), { nullable: true }); // VarChar(50) for Supplier Name
    table.columns.add('Order Status', sql.VarChar(50), { nullable: true }); // VarChar(50) for Order Status
    table.columns.add('Purchase Order Type', sql.VarChar(50), { nullable: true }); // VarChar(50) for Purchase Order Type
    table.columns.add('Part Number', sql.VarChar(50), { nullable: true }); // VarChar(50) for Part Number
    table.columns.add('Quantity Requested', sql.Float, { nullable: true }); // Float for Quantity Requested
    table.columns.add('MRNs Actual Received Qty', sql.Float, { nullable: true }); // Float for MRNs Actual Received Quantity
    table.columns.add('Invoiced Qty', sql.Float, { nullable: true }); // Float for Invoiced Quantity
    table.columns.add('Order Date', sql.Date, { nullable: true }); // Date for Order Date
    table.columns.add('MRN Date', sql.Date, { nullable: true }); // Date for MRN Date
    table.columns.add('Invoice Date PO', sql.Date, { nullable: true }); // Date for Invoice Date PO
    table.columns.add('Network Code', sql.VarChar(50), { nullable: true }); // VarChar(50) for Network Code
    table.columns.add('Brand', sql.VarChar(50), { nullable: true }); // VarChar(50) for Brand
    table.columns.add('Dealer', sql.VarChar(50), { nullable: true }); // VarChar(50) for Dealer
    table.columns.add('Location', sql.VarChar(50), { nullable: true }); // VarChar(50) for Location
    table.columns.add('BrandID', sql.VarChar(50), { nullable: true }); // VarChar(50) for Brand ID
    table.columns.add('DealerID', sql.VarChar(50), { nullable: true }); // VarChar(50) for Dealer ID
    table.columns.add('LocationID', sql.VarChar(50), { nullable: true }); // VarChar(50) for Location ID

    // Add rows to the table
    values.forEach((row) => {
      table.rows.add(
        row[0], // order number
        row[1], // supplier name
        row[2], // order status
        row[3], // purchase order type
        row[4], // part number
        row[5], // quantity requested
        row[6], // MRNs actual received quantity
        row[7], // invoiced quantity
        row[8], // order date
        row[9], // MRN date
        row[10], // invoice date PO
        row[11], // network code
        row[12], // brand
        row[13], // dealer
        row[14], // location
        row[15], // brand ID
        row[16], // dealer ID
        row[17] // location ID
      );
    });

    const request = pool.request();
    await request.query('TRUNCATE TABLE Honda_2W_purchase_register_File_Lead_Time_latest_data');
    // Execute the bulk insert
    await request.bulk(table);
   
  }
}

async  function honda2WLeadTimeOperations(pool){
        // const pool=await connection.connectDB();
        const request=await pool.request();
        const res = await request.execute('sp_Honda2WPOLeadTimeOperations');
        //  console.log("Stored procedure executed successfully.",res);
      
        return res;
      
    
}

function excelSerialToDate(serialNumber) {
    // Excel date starts at January 1, 1900, so we calculate the date from that point.
    const excelStartDate = new Date(1900, 0, 1); // January 1, 1900
    excelStartDate.setHours(0, 0, 0, 0); // Set the start of the day at midnight
  
    // Excel uses 1 as day 1, so we adjust by subtracting 1 day.
    const millisecondsInADay = 24 * 60 * 60 * 1000;
    const date = new Date(
      excelStartDate.getTime() + (serialNumber - 2) * millisecondsInADay
    );
    return date;
  }
  
  function convertToIST(date) {
    // Convert to UTC first (just to make sure we're handling time correctly)
    const utcDate = new Date(date.toUTCString());
  
    // IST is UTC +5:30, so add 5 hours and 30 minutes to the UTC date
    utcDate.setHours(utcDate.getHours() + 5);
    utcDate.setMinutes(utcDate.getMinutes() + 30);
  
    return utcDate;
  }
  
  function convertExcelSerialToIST(serialNumber) {
    if (!serialNumber || isNaN(serialNumber)) {
      console.error("Invalid serial number:", serialNumber);
      return null;
    }
  
    // Step 1: Convert Excel serial number to JavaScript Date
    const date = excelSerialToDate(serialNumber);
  
    // Step 2: Adjust the time for IST (UTC +5:30)
    const istDate = convertToIST(date);
  
    // Step 3: Format the date to a SQL-friendly string (YYYY-MM-DD)
    const formattedDate = moment(istDate).format("YYYY-MM-DD");
    // console.log("Converted date: ", formattedDate);
    formatDate=new Date(formattedDate);

    return formatDate;
  }
