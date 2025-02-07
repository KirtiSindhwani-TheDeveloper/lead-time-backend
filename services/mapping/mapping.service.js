const sql=require('mssql2');
const config=require('../../dbConfig');
const XLSX = require("xlsx");
module.exports={
  readExcelFile:async function (filePath) {
    try {
      
      // console.log("filePath ",filePath)
      // Read the Excel file
      const workbook = XLSX.readFile(filePath);
      // Process each sheet
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  
      // Convert worksheet to JSON data
      let data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); //1st row as header
      const headerRow = data[0];
      
      // Function to clean column names (headers)
      function cleanColumnNames(headers) {
        // columnNames = headers.map((col) => cleanColumnesText(col));
        // const cleanedHeaders =
        columnNames= headers.map((col) => cleanColumnesText(col.toLowerCase())).filter((col) => col.trim() !== '');
        return columnNames;
      }
      const cleanedHeaders = cleanColumnNames(data[0]); // First row is the headers
      const cleanedData = data.slice(1); // Remove the header row from the data
  
      // Map over each row and clean the values based on the cleaned headers
      const cleanedRows = cleanedData .filter(row => row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== ''))  // Ignore rows with blank cells
      .map((row) => {
        return cleanedHeaders.reduce((acc, header, index) => {
          acc[header] = cleanRowData(row[index]); // Clean the data values as well
          return acc;
        }, {});
      });
  
      // console.log("cleaned rows ", cleanedRows);
      function cleanColumnesText(str) {
        convertedStr = String(str);
        str2 = convertedStr.replace(/[\?#&_\-+=}{[\]!@`~$%^'.()\/\r\n?]+/g, "").trim()// Remove spaces, ?, and #,-,...etc
        return str2
      }
      function cleanRowData(str) {
        if (str === undefined || str === null) {
          return null;  // Replace undefined or null with a database-friendly null
        }

        if (typeof str === "number" && !isNaN(str)) {
          // Excel serial numbers typically start from 25569 (January 1, 1900)
          const excelEpoch = 25569;  // Excel date system starts on January 1, 1900
          const validExcelSerialRange = (str >= excelEpoch && str <= 999999);  // A reasonable upper limit for dates
      
          if (validExcelSerialRange) {
            const excelDate = new Date((str - excelEpoch) * 86400 * 1000);  // Convert to JavaScript Date
            return toIST(excelDate);  // Convert to IST
          } else {
            // If it's a number but not a valid date serial number, treat it as a quantity
            str+=''
            return str;  // Return the number as is (for quantities)
          }
        }
      
        // If the string can be interpreted as a valid date, convert it to a Date object
        if (isValidDate(str)) {
          const date = new Date(str);
          //console.log("parsed date",toIST(date))
          return toIST(date);  // Convert to IST
        }
        if(str<0 )
        {
          str=0;
        }
        convertedStr = String(str).replace(/'/g, "");
        // console.log("converted str ",str)
         convertedStr.replace(/[]+/g, "").trim();
        //  extra line added on 21 jan 
        convertedStr = convertedStr.replace(/\/.*?\//g, "").replace(/\//g, "");
       convertedStr= convertedStr.replace(/[^a-zA-Z0-9\s]/g, "") // Remove all non-alphanumeric characters and symbols
        .trim(); // Remove leading/trailing spaces
        return convertedStr
      }
  
      function toIST(date) {
        const options = {
          timeZone: "Asia/Kolkata",
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: true
        };
      
        // const parsedDate=new Date(date).toLocaleString("en-IN", options);
        // Using toLocaleString to format date in IST (Asia/Kolkata timezone)
        const formattedDate = date.toISOString().split('T')[0];

        const formatDate=new Date(formattedDate);
        //console.log(formattedDate);
        return formatDate
      }
      
      function isValidDate(dateString) {
        const parsedDate = new Date(dateString);
       
        return !isNaN(parsedDate.getTime());  // If it's a valid date, getTime() will not return NaN
      } 

      // Initialize an object to store sheet data
     const result = {
        headers: cleanedHeaders,
        data: cleanedRows,
      };
      // console.log("excel headers ",result.data)
      return result;
    } catch (error) {
      console.error("Error processing Excel file:", error);
      res.status(201).json({message:'Error in processing the file'})
    }
  }
,
    mappedColumns:async function(req,res){
        try{
            const pool = await sql.connect(config);
      console.log('Connected to the database successfully!');
      // Begin a transaction for inserting data
      const transaction = new sql.Transaction();
      await transaction.begin();
  
      // Prepare the SQL query for inserting data into SIMS_STOCK_FILE
      
      const request = new sql.Request(transaction);
    //   console.log("req ",req)
      const {part_number,stock_qty,added_by,loc,brand_id}=req
      const query = `
          INSERT INTO SIMS_MAPPING(brand_id,part_number, stock_qty,loc, added_on, added_by)
          VALUES (@brand_id,@part_number, @stock_qty, @loc, GETDATE(), @added_by);
        `;
  
        // Execute the insert query for each row
        await pool.request().input('brand_id', sql.BigInt, brand_id)
          .input('part_number', sql.NVarChar, part_number)
          .input('stock_qty',sql.NVarChar, stock_qty)
          .input('added_by', sql.BigInt, added_by)
          .input('loc',sql.VarChar,loc)
          .query(query);
      
  
      // Commit the transaction
      await transaction.commit();
      console.log('Data inserted successfully.');
        }
        catch(err){
            console.log("error in mapping columns",err.message);
            await transaction.rollback(); 
        }finally {
            // Close the SQL Server connection
            await sql.close();
          }
    },
   



  }



 

  

  function expandDynamicHeaders(headers, data) {
    const expandedHeaders = [];
    const subHeaderRow = data[1]; // The second row is where the sub-headers are located
  
    // Iterate through headers and dynamically expand for columns like "PROCESSING"
    headers.forEach((header, index) => {
      if (header.includes('PROCESSING')) {
        // We found a header related to processing, let's look for its sub-columns dynamically
        const processingSubColumns = subHeaderRow[index]; // Check the sub-header for this column
  
        if (processingSubColumns) {
          // Split the sub-columns by the delimiter (e.g., space, comma, etc.) if they exist
          const subHeaders = processingSubColumns.split(/\s+/);  // Assuming space-separated sub-columns
          subHeaders.forEach(subHeader => {
            expandedHeaders.push(`${header} ${subHeader}`);
          });
        } else {
          // If no sub-columns, just keep the header as it is
          expandedHeaders.push(header);
        }
      } else {
        // If not a "PROCESSING" column, just add the header as is
        expandedHeaders.push(header);
      }
    });
  
    return expandedHeaders;
  }
  
  // Function to clean column names (headers)
  function cleanColumnNames(headers) {
    return headers
      .map((col) => cleanColumnText(col.toLowerCase()))  // Clean each column name
      .filter((col) => col.trim() !== '');  // Remove empty headers
  }
  
  // Function to clean text in column names (headers)
  function cleanColumnText(str) {
    return String(str)
      .replace(/[\?#&_\-+=}{[\]!@`~$%^'()\/\r\n?]+/g, "")  // Remove unwanted characters
      .trim();
  }
  
  // Function to clean row data (e.g., remove unwanted characters, handle null/undefined values)
  function cleanRowData(str) {
    if (str === undefined || str === null) {
      return null;  // Replace undefined or null with a database-friendly null
    }
    if (str < 0) {
      str = 0;  // Handle negative values by setting to zero
    }
    return String(str).replace(/'/g, "").trim();  // Clean unwanted characters and trim
  }