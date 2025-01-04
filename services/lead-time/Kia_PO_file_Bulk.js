const connection = require('../../connection');
const sql=require('mssql2')
const moment = require("moment");
module.exports = {
  bulkInsertData: async function(pool,dealer,location) {
    const values = data.map(item => 
    {
      const Dealer = dealer || item["dealer"];  // Use provided dealer or item["dealer"]
      const Location = location || item["location"]; 
      return [
        item["po no"], // Purchase Order Number
        item['part no'], // Part Number
        item['invoice date'] !== "0-00-00" ? convertExcelSerialToIST(parseFloat(item['invoice date'])) : null, // Invoice Date
        item['gr date'] !== "0-00-00" ? convertExcelSerialToIST(parseFloat(item['gr date'])): null, // GR Date
        item['rcv qty'] !== null && !isNaN(parseFloat(item['rcv qty'])) ? item['rcv qty'] : null, // Received Quantity
        Dealer, // Dealer (assuming dealer is set earlier in your code)
        Location // Location (assuming location is set earlier in your code)
      ]
    }
    );
    
    const table = new sql.Table('kia_Pur_File_lead_time_latest_data');
    table.create = false;
    
    // Updated columns with the new names and data types
    table.columns.add('Po No', sql.VarChar(50), { nullable: true });  // VarChar(50) for Po No
    table.columns.add('Part No', sql.VarChar(50), { nullable: true }); // VarChar(50) for Part No
    table.columns.add('Invoice Date', sql.DateTime, { nullable: true }); // DateTime for Invoice Date
    table.columns.add('GR Date', sql.DateTime, { nullable: true }); // DateTime for GR Date
    table.columns.add('RCV Qty', sql.Float, { nullable: true }); // Float for Received Quantity
    table.columns.add('Dealer', sql.VarChar(100), { nullable: true }); // VarChar(100) for Dealer
    table.columns.add('Location', sql.VarChar(100), { nullable: true }); // VarChar(100) for Location

    // Add rows to the table
    values.forEach((row) => {
      table.rows.add(
        row[0], // Po No
        row[1], // Part No
        row[2], // Invoice Date
        row[3], // GR Date
        row[4], // RCV Qty
        row[5], // Dealer
        row[6] // Location
      );
    });

    const request = pool.request();
    await request.query('TRUNCATE TABLE kia_Pur_File_lead_time_latest_data');
    // Execute the bulk insert
    await request.bulk(table);
    // await request.execute('usp_UpdateOrInsertHeroLeadTimeFile');
  
  },

  bulkInsertMRNData:async function(data,pool,dealer,location){
    // console.log("item",data[0])
    const values = data.slice(1).map(item => 
    {
      const Dealer = dealer || item["dealer"];  // Use provided dealer or item["dealer"]
      const Location = location || item["location"]; 
      return [
        
        item["order no"], // Order No
        item['part no order'], // Part No Order
        item['part no current'], // Part No Current
        item['part name'], // Part Name
        item['quantity order'] !== null && !isNaN(parseFloat(item['quantity order'])) ? parseFloat(item['quantity order']) : null, // Quantity Order
        item['quantity current'] !== null && !isNaN(parseFloat(item['quantity current'])) ? parseFloat(item['quantity current']) : null, // Quantity Current
        item['po date'] !== "0-00-00" ? convertExcelSerialToIST(parseFloat(item['po date'])) : null, // PO Date
        item['pdc'], // PDC
        Dealer, // Dealer (assumed dealer is set earlier in your code)
        Location // Location (assumed location is set earlier in your code)
    ]
    }
  );

    const table = new sql.Table('kia_bo_file_lead_time_latest_data');
    table.create = false;

    // Define columns based on the new table structure
    table.columns.add('Order No', sql.VarChar(50), { nullable: true }); // Order No
    table.columns.add('Part No Order', sql.VarChar(50), { nullable: true }); // Part No Order
    table.columns.add('Part No Current', sql.VarChar(50), { nullable: true }); // Part No Current
    table.columns.add('Part Name', sql.VarChar(255), { nullable: true }); // Part Name
    table.columns.add('Quantity Order', sql.Float, { nullable: true }); // Quantity Order
    table.columns.add('Quantity Current', sql.Float, { nullable: true }); // Quantity Current
    table.columns.add('PO Date', sql.Date, { nullable: true }); // PO Date
    table.columns.add('PDC', sql.VarChar(255), { nullable: true }); // PDC
    table.columns.add('Dealer', sql.VarChar(100), { nullable: true }); // Dealer
    table.columns.add('Location', sql.VarChar(100), { nullable: true }); // Location

    // Add rows to the table
    values.forEach((row) => {
        table.rows.add(
            row[0], // Order No
            row[1], // Part No Order
            row[2], // Part No Current
            row[3], // Part Name
            row[4], // Quantity Order
            row[5], // Quantity Current
            row[6], // PO Date
            row[7], // PDC
            row[8], // Dealer
            row[9]  // Location
        );
    });

    const request = pool.request();

    try {
        // Execute the bulk insert
        await request.query('TRUNCATE TABLE kia_bo_file_lead_time_latest_data');
        await request.bulk(table);
        
    } catch (error) {
        console.error('Error during bulk insert:', error.message);
    }
  }
}
async  function kiaPurFileTimeSPOperations(pool){
        // const pool=await connection.connectDB();
        const request=await pool.request();
        const res = await request.execute('sp_KiaPurFileLeadTimeOperations');
        //  console.log("Stored procedure executed successfully.",res);
      
        return res;
      
    
}

async  function kiaBOFileTimeSPOperations(pool){
    // const pool=await connection.connectDB();
    const request=await pool.request();
    const res = await request.execute('[sp_KiaBOFileLeadTimeOperations]');
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
    //  console.log(item,serialNumber)
    if (!serialNumber || isNaN(serialNumber)) {
      console.error("Invalid serial number:", serialNumber);
      throw new error("strop")
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

