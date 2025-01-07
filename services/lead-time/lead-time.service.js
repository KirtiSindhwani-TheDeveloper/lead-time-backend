const connection = require("../../connection");
const sql = require("mssql2");
const sql2=require("mssql")
const http = require("http");
const { getLocalIp, getPublicIp, getClientIp } = require("../getIP");
const { log } = require("console");
const xlsx = require("xlsx");
const moment = require("moment");
const XLSX = require("xlsx");
const kiaBulkData=require('./Kia_PO_file_Bulk');
const honda2WBulkData=require('./Honda2W-Bulk-Data');
const renaultBulkData=require('./Renault-Bulk-Data');
const hyundaiBulkData=require('./hyundai-bulk-data');
const jcdBulkData=require('./Jcb-bulk-Data');
const mahindraBulkData=require('./Mahindra-Bulk-data')
const duplicationCheckService=require('./duplicate-upload-logic');
const JcbBulkData = require("./Jcb-bulk-Data");
const tataPCBulkData=require('./TATA-PC-Bulk-Data')
const tataCVBulkData=require('./TATA-CV-Bulk-Data')
module.exports = {
  addColumns: async function (req) {
    try {
      const clientIp = getClientIp(req);
      const localIp = getLocalIp();
      
      let publicIp = "Fetching public IP...";

      try {
        publicIp = await getPublicIp();
        console.log("public ip ", publicIp);
      } catch (error) {
        console.log(error, "error in lead time");
        publicIp = "Error fetching public IP";
      }
      const pool = await connection.connectDB();
      brand = req.brand;
      jsonData = JSON.stringify(req.brandColumns);
      // console.log("jsonData ", jsonData);
      fileType = req.fileType;
      user_id = req.userId;
      fileTypeId = req.id;
      fileName = req.fileName;
      console.log("add columns",req.id)
      let query = `Insert into FileType(file_type,file_name,brand_id)OUTPUT INSERTED.file_type_id values(@fileTypeId,@fileName,@brand)`;

      const result = await pool
        .request()
        .input("fileTypeId", fileTypeId)
        .input("fileName", fileName)
        .input("brand", brand)
        .query(query);
      // console.log("result ",result)
      const insertedId = result[0].file_type_id;
      const utcDate = new Date();
      const indiaOffset = 5.5 * 60; // IST is UTC+5:30
      const indiaTime = new Date(utcDate.getTime() + indiaOffset * 60000);
      // console.log("india ",indiaTime);
      operation = "add";
      for (let i = 0; i < req.data.length; i++) {
        columnName = req.data[i].brandColumnName;
        sequence = req.data[i].sequence;
        isVisible = "Y";
        let query1 = `Insert into MappingMaster(file_type_id,columnName,isVisible,sequence,brandColumns) values(@insertedId,@columnName,@isVisible,@sequence,@jsonData)`;
        const result = await pool
          .request()
          .input("insertedId", insertedId)
          .input("columnName", columnName)
          .input("isVisible", isVisible)
          .input("jsonData", jsonData)
          .input("sequence", sequence)
          .query(query1);
      }

      

      let query2 = `Insert into Audit_log(userID,dateTime,operation,brandID,IP,fileName,fileTypeID,brandColumns) values(@user_id,@indiaTime,@operation,@brand,@publicIp,@fileName,@fileTypeId,@jsonData)`;

      const result1 = await pool
        .request()
        .input("jsonData", jsonData)
        .input("user_id", user_id)
        .input("indiaTime", indiaTime)
        .input("fileTypeId", fileTypeId)
        .input("operation", operation)
        .input("brand", brand)
        .input("publicIp", publicIp)
        .input("fileName", fileName)
        .input("dateTime", sql.DateTime, indiaTime)
        .query(query2);
    } catch (error) {
      console.log("error ", error.message);
    }
  },

  updateColumns: async function (req) {
    try {
      const pool = await connection.connectDB();
    } catch (error) {}
  },

  fetchColumns: async function (req) {
    try {
       //console.log("req ",req)
      brand_id = req.brand_id;
      fileTypeId=req.fileTypeId
      
      const pool = await connection.connectDB();

      let query = `  SELECT  ft.file_name, ft.file_type ,mm.sequence,ft.brand_id, mm.brandColumns,mm.columnName
            FROM mappingmaster mm
            INNER JOIN filetype ft ON mm.file_type_id = ft.file_type_id
            WHERE ft.brand_id = @brand_id and file_type=@fileTypeId`;

      const result = await pool
        .request()
        .input("brand_id", brand_id)
        .input('filetypeId',fileTypeId)
        .query(query);
      // console.log("result ", result);
      return result;
    } catch (error) {
      console.log("error ", error.message);
    }
  },

  generateExcelFile: async function (data) {
    console.log("Data received for export:", data);

    if (!Array.isArray(data)) {
      throw new Error("The data must be an array of objects.");
    }
    const ws = xlsx.utils.json_to_sheet(data);

    // Create a new workbook and append the sheet
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Sheet1");

    // Return the workbook buffer (Excel file)
    return xlsx.write(wb, { bookType: "xlsx", type: "buffer" });
  },

  getUploadedDataDetails: async function (req) {
    try {
      try {
        // console.log("req ",req)
        brand_id = req.brand;
        fileTypeId=req.fileType;
        const pool = await connection.connectDB();

        let query = `  SELECT  ft.file_name, ft.file_type ,mm.sequence,ft.brand_id, mm.brandColumns,mm.columnName
                FROM mappingmaster mm
                INNER JOIN filetype ft ON mm.file_type_id = ft.file_type_id
                WHERE ft.brand_id = @brand_id`;

        const result = await pool
          .request()
          .input("brand_id", brand_id)
          .query(query);
        console.log("result ", result);
        return result;
      } catch (error) {
        console.log("error ", error.message);
      }
    } catch (error) {
      console.log("error ", error.message);
    }
  },

  createExcelFile: async function (data,fileTypes) {
    
    // console.log(data);
    return new Promise((resolve, reject) => {
      try {
        let sheet1 ,sheet2,sheet3,sheet4,sheet5,sheet6;
         
        // Create a new workbook
        // console.log("data of multi sheets ",data)

        const wb=xlsx.utils.book_new();
          if(data.length==6){
            sheet1 = xlsx.utils.json_to_sheet(data[2]);
            sheet2 = xlsx.utils.json_to_sheet(data[3]);
            sheet3 = xlsx.utils.json_to_sheet(data[4]);
            sheet4= xlsx.utils.json_to_sheet(data[5]);
          }
          if(data.length==8){
            sheet1 = xlsx.utils.json_to_sheet(data[4]);
            sheet2 = xlsx.utils.json_to_sheet(data[5]);
            sheet3 = xlsx.utils.json_to_sheet(data[6]);
            sheet4= xlsx.utils.json_to_sheet(data[7]);

          }
           let size=fileTypes.length
        for(let i=0;i<size;i++){
          if(fileTypes[i]==='Partwise OrderType'){
            console.log("fileTypes",fileTypes.length)
            xlsx.utils.book_append_sheet(wb, sheet1, "Partwise OrderType");
          }
          if(fileTypes[i]==='Partwise Summary'){
            xlsx.utils.book_append_sheet(wb, sheet2, "Partwise Summary");
          }
          if(fileTypes[i]==='Overall Summary'){
            xlsx.utils.book_append_sheet(wb, sheet3, "Overall Summary");
          }
          if(fileTypes[i]==='M1 Month'){
            xlsx.utils.book_append_sheet(wb, sheet4, "M1 Month");
          }
          
        } 
        // if(data.length==6){
        //   xlsx.utils.book_append_sheet(wb1, sheet5, "Dealer & Location");
        //   xlsx.utils.book_append_sheet(wb1, sheet6, "Part Not in Master");
        // }
        // if(data.length==8){
        //   xlsx.utils.book_append_sheet(wb1, sheet5, "PO Dealer & Location");
        //   xlsx.utils.book_append_sheet(wb1, sheet6, "PO Part Not in Master");
        //   xlsx.utils.book_append_sheet(wb1, sheet7, "MRN Dealer & Location");
        //   xlsx.utils.book_append_sheet(wb1, sheet8, "MRN Part Not in Master");
        // }

        // xlsx.utils.book_append_sheet(wb, sheet2, "Partwise Summary");
        // xlsx.utils.book_append_sheet(wb, sheet3, "Overall Summary");
        // xlsx.utils.book_append_sheet(wb, sheet4, "M1 Month");
        // Convert workbook to buffer and resolve
        const buffer = xlsx.write(wb, { bookType: "xlsx", type: "buffer" });
        
        // console.log('Buffer created with size:', buffer.length);
        resolve(buffer);
      } catch (error) {
        console.log("error ", error.message);
        reject(error);
      }
    });
  },
  createLogsFile:async function(data,res){
    return new Promise((resolve, reject) => {
      try {
        let sheet1 ,sheet2,sheet3,sheet4,sheet5,sheet6;
        // console.log("fileTypes")
        // Create a new workbook
         //console.log("data of multi sheets ",data)
      
        const wb1=xlsx.utils.book_new();
        if(data.length==6){
         
          sheet3 = xlsx.utils.json_to_sheet(data[0]);
          sheet4 = xlsx.utils.json_to_sheet(data[1]);
         
        }
        if(data.length==8){
        
          sheet1 = xlsx.utils.json_to_sheet(data[0]);
          sheet2 = xlsx.utils.json_to_sheet(data[1]);
          sheet3 = xlsx.utils.json_to_sheet(data[2]);
          sheet4= xlsx.utils.json_to_sheet(data[3]);
         
        }
      
        if(data.length==6){
          xlsx.utils.book_append_sheet(wb1, sheet3, "Dealer & Location");
          xlsx.utils.book_append_sheet(wb1, sheet4, "Part Not in Master");
        }
        if(data.length==8){
          xlsx.utils.book_append_sheet(wb1, sheet1, "PO Dealer & Location");
          xlsx.utils.book_append_sheet(wb1, sheet2, "PO Part Not in Master");
          xlsx.utils.book_append_sheet(wb1, sheet3, "MRN Dealer & Location");
          xlsx.utils.book_append_sheet(wb1, sheet4, "MRN Part Not in Master");
        }
        const buffer1=xlsx.write(wb1,{ bookType: "xlsx", type: "buffer" })
        // console.log('Buffer created with size:', buffer1.length);

        resolve(buffer1);
      } catch (error) {
        console.log("error ", error.message);
        reject(error);
      }
    });
  },
  uploadData: async function (req, excelData,res) {
    try {
      // console.log(req.data)
      fileMissMatch=false;
      brandId = req.brand_id;
      // console.log("jds", brandId)
      data = excelData.data;
      headers=excelData.headers;
      userId=req.userId;
      fileType = req.fileType;
      let pool = await connection.connectDB();
      let dealer,location;
      let rowCount=req.rowCount;
      let insertResponse;
      // console.log("updload data ",brandId,fileType,rowCount)
      if (req.dealer_id) {
        dealerId = req.dealer_id;
        query2 = `select dealer_name from Dealer_Master where dealer_id=@dealerId`;
        res1 = await pool.request().input("dealerId", dealerId).query(query2);
        dealer = res1[0].dealer_name;
      }
      if (req.location) {
        locationId = req.location;
        query3 = `select location_name from Location_Master where location_id=@locationId`;

        res3 = await pool
          .request()
          .input("locationId", locationId)
          .query(query3);
        location = res3[0].location_name;
      }

      query1 = `select brand from Brand_MASTER  where brand_id=@brandId`;
      res4 = await pool
        .request()
        .input("brandId", sql.TinyInt, brandId)
        .query(query1);

      // console.log("dealer ",dealer)
      brand = res4[0].brand;
      fileTypeId=req.fileTypeId;

      if (brandId == 33 && fileType == "PO") {
       
        // console.log(data)
        if(dealer && location ){
          const result = await readExcelFile1(dealer,location,req.filePath);
          // console.log(result.headers);
          rowCount=rowCount-1
          data = result.data;
         insertResponse=  await kiaBulkData.bulkInsertMRNData(data,pool,dealer,location)
         if(insertResponse){
          // console.log("insertRes",insertResponse)
            return insertResponse
          }
          else{
            insertResponse=false;
          }
         
        }
        else{
          const result = await readExcelFile1(null,null,req.filePath);
          // console.log(result.headers);
          rowCount=rowCount-1
          data = result.data;
        insertResponse=  await kiaBulkData.bulkInsertMRNData(data,pool,null,null)
        if(insertResponse){
          // console.log("insertRes",insertResponse)
        return insertResponse
        }
        else{
          insertResponse=false;
        }
          
        }
      }

      if(brandId==33 && fileType=="MRN"){
        if(dealer && location){
        insertResponse=  await kiaBulkData.bulkInsertData(pool,dealer,location)
        if(insertResponse){
          // console.log("insertRes",insertResponse)
        return insertResponse
       }
       else{
        insertResponse=false;
       }
        }
        else{
         insertResponse= await kiaBulkData.bulkInsertData(pool,null,null)
         if(insertResponse){
          // console.log("insertRes",insertResponse)
        return insertResponse
       }
       else{
        insertResponse=false;
       }
        }
      }

      if(brandId==22 && fileType=='PO'){
        if(dealer && location){
          insertResponse= await honda2WBulkData.bulkInsertData(pool,dealer,location);
          if(insertResponse){
            console.log("insertRes",insertResponse)
          return insertResponse
         }
         else{
          insertResponse=false;
         }
        }
        else{
          console.log(dealer,location)
         insertResponse= await honda2WBulkData.bulkInsertData(pool,null,null);
         if(insertResponse){
          console.log("insertRes",insertResponse)
          return insertResponse
          }
          else{
            insertResponse=false;
          }
        }
      }

      if(brandId==12 &&fileType=='MRN'){
        if(dealer && location){
         insertResponse= await renaultBulkData.bulkInsertMRNData(pool,dealer,location)
         if(insertResponse){
          // console.log("insertRes",insertResponse)
        return insertResponse
        }
        else{
          insertResponse=false;
        }
        }
        else{
         insertResponse= await renaultBulkData.bulkInsertMRNData(pool,null,null)
         if(insertResponse){
          // console.log("insertRes",insertResponse)
        return insertResponse
       }
       else{
        insertResponse=false;
       }
        }
      }

      if(brandId==12 && fileType=="PO"){
        if(dealer && location){
        insertResponse=  await renaultBulkData.bulkInsertPOData(data,pool,dealer,location)
        if(insertResponse){
          console.log("insertRes",insertResponse)
        return insertResponse
        }
        else{
          insertResponse=false;
        }
        }
        else{
         insertResponse= await renaultBulkData.bulkInsertPOData(data,pool,null,null)
         if(insertResponse){
          // console.log("insertRes",insertResponse)
        return insertResponse
          }
          else{
            insertResponse=false;
          }
        }
      }

      if(brandId==11 && fileType=='PO'){
        
        if(dealer && location){
          const result = await readExcelFile1(dealer,location,req.filePath);
        // console.log(result.headers);
        rowCount=rowCount-1
        data = result.data;
         insertResponse=  await hyundaiBulkData.bulkInsertData(data,pool,dealer,location)
         if(insertResponse){
          // console.log("insertRes",insertResponse)
            return insertResponse
          }
          else{
            insertResponse=false;
          }
        }
        else{
          const result = await readExcelFile1(null,null,req.filePath);
        // console.log(result.headers);
        rowCount=rowCount-1
        data = result.data;
        insertResponse=  await hyundaiBulkData.bulkInsertData(data,pool,null,null)
        if(insertResponse){
          // console.log("insertRes",insertResponse)
        return insertResponse
       }
       else{
        insertResponse=false;
       }
        }
      }
      if(brandId==11 && fileType=='MRN'){
        if(dealer && location){
         insertResponse= await hyundaiBulkData.bulkPOInsertData(pool,dealer,location)
         if(insertResponse){
          // console.log("insertRes",insertResponse)
            return insertResponse
          }
          else{
            insertResponse=false;
          }
        }else{
          insertResponse=await hyundaiBulkData.bulkPOInsertData(pool,null,null)
          if(insertResponse){
            // console.log("insertRes",insertResponse)
          return insertResponse
         }
         else{
          insertResponse=false;
         }
        }
      }

      if(brandId==32 && fileType=='PO'){
        pool=await connection.connectDB();
        if(dealer && location){
        insertResponse=  await JcbBulkData.bulkInsertData(pool,dealer,location)
        if(insertResponse){
          // console.log("insertRes",insertResponse)
        return insertResponse
       }
       else{
        insertResponse=false;
       }
        }
        else{
         insertResponse= await JcbBulkData.bulkInsertData(pool,null,null)
         if(insertResponse){
          // console.log("insertRes",insertResponse)
        return insertResponse
       }
       else{
        insertResponse=false;
       }
        }
      }
      if(brandId==32 && fileType=='MRN'){
        if(dealer && location){
        insertResponse=  await JcbBulkData.bulkMRNInsertData(pool,dealer,location)
          if(insertResponse){
            // console.log("insertRes",insertResponse)
          return insertResponse
         }
         else{
          insertResponse=false;
         }
        }
        else{
         insertResponse= await JcbBulkData.bulkMRNInsertData(pool,null,null)
          if(insertResponse){
            // console.log("insertRes",insertResponse)
          return insertResponse
         }
         else{
          insertResponse=false;
         }
        }
      }

      if(brandId==9 && fileType=='PO'){

        if(dealer && location ){
          // console.log("headers ",headers)
         insertResponse= await mahindraBulkData.bulkInsertData(pool,dealer,location,res,headers)
         console.log("insertRes",insertResponse)
         if(insertResponse){
          return insertResponse;
         }
         else{
          insertResponse=false;
         }
        }
        else{
          // console.log("headers ",headers)
         insertResponse= await mahindraBulkData.bulkInsertData(pool,null,null,res,headers)
        //  console.log("insertRes",insertResponse)
         if(insertResponse){
            console.log("insertRes",insertResponse)
          return insertResponse
         }
         else{
          insertResponse=false;
         }
        }
      }

      if(brandId==9 && fileType=='MRN'){

        if(dealer && location){

          insertResponse=await mahindraBulkData.bulkMRNInsertData(pool,dealer,location)
          if(insertResponse){
            console.log("insertRes",insertResponse)
          return insertResponse
         }
         else{
          insertResponse=false;
         }
        } 
      else{
        insertResponse=await mahindraBulkData.bulkMRNInsertData(pool,null,null)
      if(insertResponse){
        console.log("insertRes",insertResponse)
      return insertResponse
     }
     else{
      insertResponse=false;
     }
     }
        
      }
    if (brandId === 20) {
      // pool=await connection.connectDB();
      let isNullFound=false;
      for(let item of data){
          const Dealer = dealer || item["dealer"];  // Use provided dealer or item["dealer"]
      const Location = location || item["location"];
          if(!Dealer || !Location || !item["part number"]){

                  isNullFound=true;
                  
                  return isNullFound;    
          }
      }
      if(!isNullFound){
      const values = data.map(item => {
        const Dealer = dealer || item["dealer"];  // Use provided dealer or item["dealer"]
      const Location = location || item["location"]; 
      return [  
        item["purchase order number"],
        item['order status'],
        convertExcelSerialToIST(parseFloat(item['order date'])),
        item['invoice date'] !== "0-00-00" ? convertExcelSerialToIST(parseFloat(item['invoice date'])) : null,
        item['grn invoice date'] !== "0-00-00" ? convertExcelSerialToIST(parseFloat(item['grn invoice date'])) : null,
        item['order subtype'],
        item['part number'],
        // Check if 'order quantity' is a valid number or is null
        item['order quantity'] !== null && !isNaN(parseFloat(item['order quantity'])) ? parseFloat(item['order quantity']) : null,
        // Check if 'invoice quantity' is a valid number or is null
        item['invoice quantity'] !== null && !isNaN(parseFloat(item['invoice quantity'])) ?  parseFloat(item['invoice quantity']) : null,
        Dealer,
        Location
      ]});
        //  console.log("values ",values);
      const table = new sql.Table('Hero_Lead_Time_File_latest_data');
      table.create = false;   
      

      table.columns.add('Purchase Order Number', sql.VarChar(255),{nullable:true});  // VarChar(255)
    table.columns.add('Order Status', sql.VarChar(100),{nullable:true});           // VarChar(100)
    table.columns.add('Order Date', sql.Date,{nullable:true});                     // Date
    table.columns.add('Invoice Date', sql.Date,{nullable:true});                   // Date
    table.columns.add('GRN Invoice Date', sql.Date,{nullable:true});               // Date
    table.columns.add('Order Subtype', sql.VarChar(255),{nullable:true});          // VarChar(255)
    table.columns.add('Part Number', sql.VarChar(150),{nullable:true});            // VarChar(150)
    table.columns.add('Order Quantity', sql.Decimal(38, 2),{nullable:true});       // Decimal(38,2)
    table.columns.add('Invoice Quantity', sql.Decimal(38, 2),{nullable:true});     // Decimal(38,2)
    table.columns.add('Dealer', sql.VarChar(100),{nullable:true});                 // VarChar(100)
    table.columns.add('Location', sql.VarChar(100),{nullable:true});   
      // Add rows to the table
      values.forEach((row) => {
        table.rows.add(
          row[0], // purchase order number
          row[1], // order status
          row[2], // order date
          row[3], // invoice date
          row[4], // grn invoice date
          row[5], // order subtype
          row[6], // part number
          row[7], // order quantity
          row[8], // invoice quantity
          row[9], // dealer
          row[10] // location
        );
      });

      
      const request =  pool.request();
      await request.query('TRUNCATE TABLE Hero_Lead_Time_File_latest_data');
      // Execute the bulk insert
      await request.bulk(table);
     
    }
    }

    if(brandId==17 && fileType=='PO'){
      console.log("dealer ",dealer ,"loc ",location)
      if(dealer && location){
        insertResponse= await tataCVBulkData.bulkPOInsertData(pool,dealer,location)
        if(insertResponse){
          // console.log("insertRes",insertResponse)
        return insertResponse
       }
       else{
        insertResponse=false;
       }
      }
      else{
        insertResponse= await tataCVBulkData.bulkPOInsertData(pool,null,null)
        if(insertResponse){
          // console.log("insertRes",insertResponse)
        return insertResponse
       }
       else{
        insertResponse=false;
       }
      }
    }
    if(brandId==28 && fileType=='PO'){
      if(dealer && location){
       insertResponse= await tataPCBulkData.bulkPOInsertData(pool,dealer,location);
        if(insertResponse){
          // console.log("insertRes",insertResponse)
        return insertResponse
       }
       else{
        insertResponse=false;
       }
      }
      else{
       insertResponse=  await tataPCBulkData.bulkPOInsertData(pool,null,null);
       if(insertResponse){
        // console.log("insertRes",insertResponse)
      return insertResponse
     }
     else{
      insertResponse=false;
     }
      }
    }

    operation="upload"
    const clientIp = getClientIp(req);
    const localIp = getLocalIp();
    let publicIp = "Fetching public IP...";
    try {
      publicIp = await getPublicIp();
      console.log("public ip ", publicIp);
    } catch (error) {
      console.log(error, "error in lead time");
      publicIp = "Error fetching public IP";
    }
    console.log("rowCount ",rowCount)
    // if(insertResponse.status==200){
      await insertInAuditLogs(pool,userId,req.dealer_id,req.location,req.brand_id,publicIp,rowCount,fileTypeId);
     console.log("logs inserted successfully------") 

   // }
  
  } catch (error) {
      console.log("error in service ", error);
      fileMissMatch=true;
      return fileMissMatch
    }
  },

  getExportFileTypeData: async function (req,res) {
    try {
      // Connect to the database
      const pool = await connection.connectDB();
    
      // Extract values from the request object
      const {
        brand: brandId,
        dealer,
        location,
        category,
        fromMonth,
        toMonth
      } = req;
    
      // Initialize result variable
      let result;
    
      // Validate brandId (required field)
      if (!brandId) {
        return res.status(400).json({ error: 'Missing required parameter: brand' });
      }
    
      // Assign default values to optional parameters
      const params = {
        dealerId: dealer || null,
        locationId: location || null,
        category: category || null,
        fromDate: fromMonth ? (function() {
          const [datePart] = fromMonth.split('T');  // Split only by 'T' to get the date part
          // const parsedDate = new Date(datePart);   // Use only the date part to create the Date object
          // return isNaN(parsedDate.getTime()) ? null : parsedDate;  // Return null if invalid date
          return datePart
        })() : null, 
        
        // Parse only the date part from toMonth, ignoring the time part
        toDate: toMonth ? (function() {
          const [datePart] = toMonth.split('T');  // Split only by 'T' to get the date part
          const parsedDate = new Date(datePart);   // Use only the date part to create the Date object
          // return isNaN(parsedDate.getTime()) ? null : parsedDate;  // Return null if invalid date
          return datePart
        })() : null
       
      };
      // console.log("params ",params)
    
      // Determine which stored procedure to use based on brandId
      let procedureName = '';
      switch (brandId) {
        case 33:
          procedureName = "UAD_Lead_Time_Base_Kia_New_Data_for_updation";
          break;
        case 11:
          procedureName = "UAD_Lead_Time_Base_Hyundai_New_Data_for_updation";
          break;
        case 20:
          procedureName = "UAD_Lead_Time_Base_hero_New_Data_for_updation_fe";
          break;
        case 12:
          procedureName="UAD_Lead_Time_Base_renault_New_Data_for_updation";
            break;
        case 17:
            procedureName="UAD_Lead_Time_Base_tata_cv_New_Data_for_updation";
                break;
        case 28:
            procedureName="UAD_Lead_Time_Base_tata_pc_New_Data_for_updation";
               break; 
        case 9:
              procedureName="UAD_Lead_Time_Base_mahindra_New_Data_for_updation ";
                 break;
         case 32:
           procedureName="UAD_Lead_Time_Base_jcb_New_Data_for_updation ";
                break; 
          case 22:
             procedureName="UAD_Lead_Time_Base_honda_2w_New_Data_for_updation ";
                break;       
        default:
          return res.status(400).json({ error: `Unknown brandId: ${brandId}` });
      }
    
      try {
        // Prepare the SQL query
        const request =await  pool.request();
    
        // Add parameters dynamically, only if they are not null
        Object.keys(params).forEach(key => {
          if (params[key] !== null) {
            // const sqlType = getSqlType(key); // Determine the correct SQL type
            request.input(key, params[key]);
          }
        });
    
        // Execute the stored procedure
        result = await request.execute(procedureName);
    // console.log("stored procedure executed ",result)
        // Return the result only once
        return result; // Adjust based on your actual result structure
    
      } catch (err) {
        // Handle execution errors and ensure no other response is sent after this
        console.error("Error executing stored procedure:", err);
        if (!res.headersSent) {  // Check if headers have already been sent
          return res.status(500).json({ error: 'Internal Server Error' });
        }
      }
    
    } catch (err) {
      // Handle database connection errors and ensure no other response is sent after this
      console.error("Error connecting to database or processing request:", err);
      if (!res.headersSent) {  // Check if headers have already been sent
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }
    

    },

  downloadFormat: async function (req) {
    // console.log("req ",req.locationMaster)
    return new Promise((resolve, reject) => {
      try {
        const mappedData = req.body.data.map((data) => {
          return {
            File_name: data.file_name.trim(),
            file_type: data.fileType,
            sequence: data.sequence,
            brand: data.brandName,
            column_name: data.columnName,
          };
        });
        //console.log("mapped data ",mappedData)

        const wb = xlsx.utils.book_new();
        const sheet1 = xlsx.utils.json_to_sheet(mappedData);
        const sheet2 = xlsx.utils.json_to_sheet(req.locationMaster);

        // Append sheets to workbook

        xlsx.utils.book_append_sheet(wb, sheet1, "Mapped Data");

        xlsx.utils.book_append_sheet(wb, sheet2, "Location Master");
        // Convert workbook to buffer and resolve
        // const buffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });
        const buffer = xlsx.write(wb, { bookType: "xlsx", type: "buffer" });
        console.log("Buffer created with size:", buffer.length);
        resolve(buffer);
      } catch (error) {
        console.log("error ", error.message);
        reject(error);
      }
    });
  },

  getFileTypeBasedOnBrand: async function(req){
    try{
      let pool=await connection.connectDB();
      brandId=req.brand_id;
      console.log(brandId)
      let query=`Select * from fileType_Master where brandID=@brandId`;
      const result=await pool.request().input('brandId',brandId).query(query);
      console.log("res ",result)
      return result;
    }
    catch(error){
      console.log("error ",error)
    }
    

  },
 

  getUploadLogs:async function(req){
    try{

      const pool=await connection.connectDB();
      let brandId = req.brand;
      let dealerId = req?.dealer;
      let locationId = req?.location;
      let userId=req.userId
      console.log("dealer ",dealerId,locationId)
      
      let query = `SELECT userID, brandID, dealerID, locationID, dateTime, noOfRecords 
                   FROM Audit_Log 
                   WHERE brandID = @brandId and operation='upload' and userID=@userId`;
      
      if (dealerId !== null && dealerId !== undefined) {
          query += ` AND dealerID = @dealerId`;
      }
      
      if (locationId !== null && locationId !== undefined) {
          query += ` AND locationID = @locationId`;
      }
      
      if (dealerId === null || dealerId==undefined) {
        query += ` AND dealerID IS NULL`; // Filter records where dealerID is NULL
    }
    
    if (locationId === null || locationId==undefined
    ) {
        query += ` AND locationID IS NULL`; // Filter records where locationID is NULL
    }
      const request = await pool.request().input('brandId', brandId).input('userId',userId);
      
      if (dealerId !== null && dealerId !== undefined) {
          request.input('dealerId', dealerId);
      }
      
      if (locationId !== null && locationId !== undefined) {
          request.input('locationId', locationId);
      }
      
      const res = await request.query(query);
      return res;
      
    }
    
    catch(error){
      console.log("error in upload Logs ",error.message)
    }
  },
   readExcelFile:async function(filePath) {
    try {
      // Read the Excel file
      const workbook = XLSX.readFile(filePath);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  
      // Convert worksheet to JSON data (first row as header)
      let data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
      const headerRow = data[0];
      //  console.log("headerRow ",headerRow)
      const subHeaders = [
        "",
        "",
        "ORDER",
        "CURRENT",
        "",
        "",
        "ORDER",
        "CURRENT",
        "",
        "",
        "",
        "",
      ];
  
      const cleanedData = data.slice(1); // Skip the header row for actual data
      // Function to combine headers and subheaders, handling empty items
      const combineHeaders = (headerRow, subHeaders) => {
        const combinedHeaders = [];
        let i = 0;
  
        while (i < headerRow.length) {
          const headerItem = headerRow[i];
          const subHeaderItem = subHeaders[i];
  
          // If the header item is empty (i.e., a placeholder)
          if (!headerItem && subHeaderItem) {
            // Combine current header item with the next non-empty subheader
            headerItemPrev = headerRow[i - 1];
            combinedHeaders.push(`${headerItemPrev} ${subHeaderItem}`);
          } else if (headerItem && subHeaderItem) {
            // Combine both header and subheader if both are non-empty
            combinedHeaders.push(`${headerItem} ${subHeaderItem}`);
          } else {
            // If the header item is not empty, keep it as it is
            combinedHeaders.push(headerItem);
          }
  
          i++; // Move to the next element
        }
  
        return combinedHeaders;
      };
  
      // Combine the headers and subheaders
      const combinedHeaders = combineHeaders(headerRow, subHeaders);
      const cleanedHeaders = cleanColumnNames(combinedHeaders);
  
      //   console.log(combinedHeaders);
      const cleanedRows = cleanedData
        .filter((row) =>
          row.some(
            (cell) =>
              cell !== null && cell !== undefined && String(cell).trim() !== ""
          )
        ) // Ignore rows with blank cells
        .map((row) => {
          return cleanedHeaders.reduce((acc, header, index) => {
            acc[header] = cleanRowData(row[index]); // Clean the data values as well
            return acc;
          }, {});
        });
      function cleanColumnNames(headers) {
        // Apply cleaning functions to each column name
        // console.log(headers)
        const columnNames = headers
          .filter((col) => col !== undefined && col !== null)
          .map((col) => cleanColumnesText(col.toLowerCase())) // Convert to lowercase and clean
          .filter((col) => col.trim() !== ""); // Remove empty columns
  
        return columnNames;
      }
      // console.log("cleaned rows ", cleanedRows);
      function cleanColumnesText(str) {
        convertedStr = String(str);
        str2 = convertedStr
          .replace(/[\?#&_\-+=}{[\]!@`~$%^'()\/\r\n?]+/g, "")
          .trim(); // Remove spaces, ?, and #,-,...etc
        return str2;
      }
      function cleanRowData(str) {
        if (str === undefined || str === null) {
          return null; // Replace undefined or null with a database-friendly null
        }
        if (str < 0) {
          str = 0;
        }
        convertedStr = String(str).replace(/'/g, "");
        // console.log("converted str ",str)
        return convertedStr.replace(/[]+/g, "").trim();
      }
  
      // Initialize an object to store sheet data
      const result = {
        headers: cleanedHeaders,
        data: cleanedRows,
      };
      //    console.log("excel headers ",result.data)
      return result;
    } catch (error) {
      console.error("Error processing Excel file:", error);
      throw new Error("Failed to read the Excel file");
    }
  },
  mappingExist:async function(req){
    const pool = await connection.connectDB();
    brand = req.brand;
    fileTypeId = req.id;
    let query = `Select brand_id,file_type where brand_id=@brand and file_type=@fileTypeId`;

    const result=await pool.request().input("brand",brand)
    .input('fileType',fileTypeId).query(query);

    return result;

  
  }
};

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



async function insertInAuditLogs(pool,userId,dealer_id,location,brand_id,publicIp,rowCount,fileTypeId){
  console.log(rowCount)
  pool=await connection.connectDB();
  const utcDate = new Date();
  const indiaOffset = 5.5 * 60; // IST is UTC+5:30
  const indiaTime = new Date(utcDate.getTime() + indiaOffset * 60000);
  let query2 = `Insert into Audit_log(userID,dealerID,brandID,locationID,dateTime,operation,IP,noOfRecords,fileTypeID)
   values(@userId,@dealer_id, @brand_id, @location,@indiaTime,@operation,@publicIp,@rowCount,@fileTypeId)`;

  const result1 = await pool
    .request()
    .input('fileTypeId',fileTypeId)
    .input("userId", userId)
    .input("rowCount", rowCount)
    .input("dealer_id", dealer_id)
    .input("operation", operation)
    .input("brand_id", brand_id)
    .input("publicIp", publicIp)
    .input("location", location)
    .input("indiaTime", sql.DateTime, indiaTime)
    .query(query2);

    console.log("logs inserted succesfully----")
}

async function heroLeadTimeSPOperations(pool){
  // const pool=await connection.connectDB();
  const request=await pool.request();
  const res = await request.execute('sp_HeroLeadTimeOperations');
  //  console.log("Stored procedure executed successfully.",res);

  return res;

}

async function readExcelFile1(dealer,location,filePath) {
  try {
    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    // Convert worksheet to JSON data (first row as header)
    let data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const headerRow = data[0];
    let subHeaders;
    //  console.log("headerRow ",headerRow)
    if(dealer && location){
      subHeaders = [
    
        "",
        "",
        "ORDER",
        "CURRENT",
        "",
        "",
        "ORDER",
        "CURRENT",
        "",
        "",
        "",
        "",
      ];
    }
    else{
      subHeaders = [
        "",
        "",
        "",
        "",
        "",
        "ORDER",
        "CURRENT",
        "",
        "",
        "ORDER",
        "CURRENT",
        "",
        "",
        "",
        "",
      ];
    }
     

    const cleanedData = data.slice(1); // Skip the header row for actual data
    // Function to combine headers and subheaders, handling empty items
    const combineHeaders = (headerRow, subHeaders) => {
      const combinedHeaders = [];
      let i = 0;

      while (i < headerRow.length) {
        const headerItem = headerRow[i];
        const subHeaderItem = subHeaders[i];

        // If the header item is empty (i.e., a placeholder)
        if (!headerItem && subHeaderItem) {
          // Combine current header item with the next non-empty subheader
          headerItemPrev = headerRow[i - 1];
          combinedHeaders.push(`${headerItemPrev} ${subHeaderItem}`);
        } else if (headerItem && subHeaderItem) {
          // Combine both header and subheader if both are non-empty
          combinedHeaders.push(`${headerItem} ${subHeaderItem}`);
        } else {
          // If the header item is not empty, keep it as it is
          combinedHeaders.push(headerItem);
        }

        i++; // Move to the next element
      }

      return combinedHeaders;
    };

    // Combine the headers and subheaders
    const combinedHeaders = combineHeaders(headerRow, subHeaders);
    const cleanedHeaders = cleanColumnNames(combinedHeaders);

    //   console.log(combinedHeaders);
    const cleanedRows = cleanedData
      .filter((row) =>
        row.some(
          (cell) =>
            cell !== null && cell !== undefined && String(cell).trim() !== ""
        )
      ) // Ignore rows with blank cells
      .map((row) => {
        return cleanedHeaders.reduce((acc, header, index) => {
          acc[header] = cleanRowData(row[index]); // Clean the data values as well
          return acc;
        }, {});
      });
    function cleanColumnNames(headers) {
      // Apply cleaning functions to each column name
      // console.log(headers)
      const columnNames = headers
        .filter((col) => col !== undefined && col !== null)
        .map((col) => cleanColumnesText(col.toLowerCase())) // Convert to lowercase and clean
        .filter((col) => col.trim() !== ""); // Remove empty columns

      return columnNames;
    }
    // console.log("cleaned rows ", cleanedRows);
    function cleanColumnesText(str) {
      convertedStr = String(str);
      str2 = convertedStr
        .replace(/[\?#&_\-+=}{[\]!@`~$%^'()\/\r\n?]+/g, "")
        .trim(); // Remove spaces, ?, and #,-,...etc
      return str2;
    }
    function cleanRowData(str) {
      if (str === undefined || str === null) {
        return null; // Replace undefined or null with a database-friendly null
      }
      if (str < 0) {
        str = 0;
      }
      convertedStr = String(str).replace(/'/g, "");
      // console.log("converted str ",str)
      return convertedStr.replace(/[]+/g, "").trim();
    }

    // Initialize an object to store sheet data
    const result = {
      headers: cleanedHeaders,
      data: cleanedRows,
    };
    //    console.log("excel headers ",result.data)
    return result;
  } catch (error) {
    console.error("Error processing Excel file:", error);
    throw new Error("Failed to read the Excel file");
  }
}
// module.exports={readExcelFile1}

// async function getFileTypeBasedOnBrand(req){
//   console.log("res ",req)
// }