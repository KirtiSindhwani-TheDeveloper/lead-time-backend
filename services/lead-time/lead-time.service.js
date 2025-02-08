const connection = require("../../connection");
const path=require('path')
const sql = require("mssql2");
const AdmZip = require('adm-zip');
const sql2=require("mssql")
const http = require("http");
const fs=require('fs')
const { getLocalIp, getPublicIp, getClientIp } = require("../getIP");
const { log } = require("console");
const xlsx = require("xlsx");
const moment = require("moment");
const XLSX = require("xlsx");
const kiaBulkData=require('./Kia_PO_file_Bulk');
const honda2WBulkData=require('./Honda2W-Bulk-Data');
const heroBulkData=require('./hero-bulk-data')
const renaultBulkData=require('./Renault-Bulk-Data');
const hyundaiBulkData=require('./hyundai-bulk-data');
const jcdBulkData=require('./Jcb-bulk-Data');
const mahindraBulkData=require('./Mahindra-Bulk-data')
const duplicationCheckService=require('./duplicate-upload-logic');
const JcbBulkData = require("./Jcb-bulk-Data");
const tataPCBulkData=require('./TATA-PC-Bulk-Data')
const tataCVBulkData=require('./TATA-CV-Bulk-Data')
const archiver = require('archiver');
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
      // fileMissMatch=false;
      brandId = req.brand_id;
      // console.log("jds", brandId)
      // data = excelData.data;
      headers=excelData.headers;
      userId=req.userId;
      fileType = req.fileType;
      //console.log("--------",fileType)
      let pool = await connection.connectDB();
      let dealer,location;
      let rowCount=req.rowCount;
      let insertResponse;
      let mrnFailed = false;
      let tableNameMRN=''
      let tableNamePO=''
    let poFailed = false;
      // console.log("updload data ",brandId,fileType,rowCount)

        brandId = req.brand_id;
        query23 = `select distinct brand as vcBrand from z_scope.dbo.locationInfo where BrandID=@brandId`;
        res13 = await pool.request().input("brandId", brandId).query(query23);
        let brandName = res13[0].vcBrand;
        // console.log(res13[0].vcBrand,brandName);
      if (req.dealer_id) {
        dealerId = req.dealer_id;
        query2 = `select distinct dealer as vcName from z_scope.dbo.locationInfo where dealerID=@dealerId`;
        res1 = await pool.request().input("dealerId", dealerId).query(query2);
        dealer = res1[0].vcName;
      }
      if (req.location) {
        locationId = req.location;
        query3 = `select Location from z_scope.dbo.locationInfo where locationID=@locationId`;

        res3 = await pool
          .request()
          .input("locationId", locationId)
          .query(query3);
        location = res3[0].Location;
      }

      query1 = `select vcbrand from z_scope.dbo.Brand_MASTER  where bigid=@brandId`;
      res4 = await pool
        .request()
        .input("brandId", sql.TinyInt, brandId)
        .query(query1);

      // console.log("dealer ",dealer)
      brand = res4[0].brand;
      fileTypeId=req.fileTypeId;

      if (brandId == 33 && req.fileType == "PO") {
       
        // console.log(data)
        if(dealer && location ){
          const result = await readExcelFile1(dealer,location,req.filePath);
          // console.log(result.headers);
          rowCount=result.data.length-1;
          data1 = result.data;
         insertResponse=  await kiaBulkData.bulkInsertPOData(data1,pool,dealer,location,res)
         if(!insertResponse){
          insertResponse=false;
        }
         
        }
        else{
          const result = await readExcelFile1(null,null,req.filePath);
          // console.log(result.headers);
          rowCount=result.data.length-1;
          data1 = result.data;
        insertResponse=  await kiaBulkData.bulkInsertPOData(data1,pool,null,null,res)
        if(!insertResponse){
          insertResponse=false;
        }
          
        }
      }

      if(brandId==33 && req.fileType=="MRN"){
        if(dealer && location){
        insertResponse=  await kiaBulkData.bulkInsertMRNData(excelData.data,pool,dealer,location,res)
        if(!insertResponse){
          insertResponse=false;
        }
        }
        else{
         insertResponse= await kiaBulkData.bulkInsertMRNData(excelData.data,pool,null,null,res)
         if(!insertResponse){
          insertResponse=false;
        }
        }
      }

      if(brandId==22 ){
        if(dealer && location){

          insertResponse= await honda2WBulkData.bulkInsertData(excelData.data,pool,brandName,dealer,location,req.brand_id,req.dealer_id,req.location,res);
           if(!insertResponse){
          insertResponse=false;
        }
        }
        else{
          // console.log(dealer,location)
         insertResponse= await honda2WBulkData.bulkInsertData(excelData.data,pool,brandName,null,null,req.brand_id,req.dealer_id,req.location,res);
         if(!insertResponse){
          insertResponse=false;
        }
        }
      }

      if(brandId===12  ){
        // console.log(req.fileType);
        if(req.fileType==='MRN'){
          try{

            if(dealer && location){
             insertResponse= await renaultBulkData.bulkInsertMRNData(excelData.data,pool,dealer,location,res)
             //console.log("insert response in mrn ",insertResponse)
             if(!insertResponse){
              
              // console.log("insertRes",insertResponse)
             insertResponse=false;
              // mrnFailed=true;
            }
            }
            else{
             insertResponse= await renaultBulkData.bulkInsertMRNData(excelData.data,pool,null,null,res)
             if(!insertResponse){
              // console.log("insertRes",insertResponse)
             insertResponse=false;
            //  mrnFailed=true;
           }
            }
          }

          catch(error){
            console.error('Error inserting MRN data:', error.message);
            //mrnFailed = true;
          }

        }
        if(req.fileType==='PO'){
          if(dealer && location){
            insertResponse=  await renaultBulkData.bulkInsertPOData(excelData.data,pool,dealer,location,res)
            // console.log("insert response in po ",insertResponse)
            if(!insertResponse){
              insertResponse=false;
            }
            }
            else{
              try{
                insertResponse= await renaultBulkData.bulkInsertPOData(excelData.data,pool,null,null,res)
                if(!insertResponse){
                  insertResponse=false;
                }
              }
              catch(error){
                console.error('Error inserting PO data:', error.message);
               // poFailed = true;
              }
            }
        }
        // console.log("mrn ")
      }


      if(brandId==11 ){
        // console.log("jdsfsdjf hyundai po ")
        if(req.fileType=='PO'){
          if(dealer && location){
            const result = await readExcelFile1(dealer,location,req.filePath);
          // console.log(result.headers);
          rowCount=result.data.length-1;
          // console.log("rowCount ",rowCount)
          data1 = result.data;
           insertResponse=  await hyundaiBulkData.bulkInsertPOData(data1,pool,dealer,location,res)
           if(!insertResponse){
            insertResponse=false;
          }
          }
          else{
            // console.log("hyundai po")
            const result = await readExcelFile1(null,null,req.filePath);
          //  console.log(result.headers);
          rowCount=result.data.length-1;
          // console.log("rowCount ",rowCount)
          data = result.data;
          insertResponse=  await hyundaiBulkData.bulkInsertPOData(data,pool,null,null,res)
          if(!insertResponse){
            insertResponse=false;
          }
          }

        }
        if(req.fileType=='MRN'){
          if(dealer && location){
            insertResponse= await hyundaiBulkData.bulkInsertData(excelData.data,pool,dealer,location,res)
            if(!insertResponse){
              insertResponse=false;
            }
           }else{
             insertResponse=await hyundaiBulkData.bulkInsertData(excelData.data,pool,null,null,res)
             if(!insertResponse){
              insertResponse=false;
            }
           }
        }
      }

      if(brandId==32 && req.fileType=='PO'){
        pool=await connection.connectDB();
        if(dealer && location){
        insertResponse=  await JcbBulkData.bulkInsertData(excelData.data,pool,dealer,location,res)
        if(!insertResponse){
          insertResponse=false;
        }
        }
        else{
         insertResponse= await JcbBulkData.bulkInsertData(excelData.data,pool,null,null,res)
         if(!insertResponse){
          insertResponse=false;
        }
        }
      }
      if(brandId==32 && req.fileType=='MRN'){
        if(dealer && location){
        insertResponse=  await JcbBulkData.bulkMRNInsertData(excelData.data,pool,dealer,location,res)
        if(!insertResponse){
          insertResponse=false;
        }
        }
        else{
         insertResponse= await JcbBulkData.bulkMRNInsertData(excelData.data,pool,null,null,res)
         if(!insertResponse){
          insertResponse=false;
        }
        }
      }

      if(brandId==9 && req.fileType=='PO'){

        if(dealer && location ){
          // console.log("headers ",headers)
         insertResponse= await mahindraBulkData.bulkInsertData(excelData.data,pool,dealer,location,res,excelData.headers)
        //  console.log("insertRes",insertResponse)
        if(!insertResponse){
          insertResponse=false;
        }
        }
        else{
          // console.log("headers ",headers)
         insertResponse= await mahindraBulkData.bulkInsertData(excelData.data,pool,null,null,res,excelData.headers)
        //  console.log("insertRes",insertResponse)
        if(!insertResponse){
          insertResponse=false;
        }
        }
      }

      if(brandId==9 && req.fileType=='MRN'){
        // rowCount=rowCount-2;
        rowCount=excelData.data.length-1;
        if(dealer && location){
          // console.log(excelData.data)
          insertResponse=await mahindraBulkData.bulkMRNInsertData(excelData.data,pool,dealer,location,res)
          if(!insertResponse){
            insertResponse=false;
          }
        } 
      else{
        //  console.log(excelData.data)
        insertResponse=await mahindraBulkData.bulkMRNInsertData(excelData.data,pool,null,null,res)
        if(!insertResponse){
          insertResponse=false;
        }
     }
        
      }
    if (brandId === 20) {
      // pool=await connection.connectDB();
      if(dealer && location){
        insertResponse= await heroBulkData.bulkInsertData(excelData.data,pool,dealer,location,res);
        if(!insertResponse){
          insertResponse=false;
        }
      }
      else{
        // console.log(dealer,location)
       insertResponse= await heroBulkData.bulkInsertData(excelData.data,pool,null,null,res);
       if(!insertResponse){
        insertResponse=false;
      }
      }
    }

    if(brandId==17 ){
      //console.log("dealer ",dealer ,"loc ",location)
      if(dealer && location){
        insertResponse= await tataCVBulkData.bulkPOInsertData(excelData.data,pool,dealer,location,res)
        if(!insertResponse){
          insertResponse=false;
        }
      }
      else{
        insertResponse= await tataCVBulkData.bulkPOInsertData(excelData.data,pool,null,null,res)
        if(!insertResponse){
          insertResponse=false;
        }
      }
    }
    if(brandId==28 ){
      if(dealer && location){
       insertResponse= await tataPCBulkData.bulkPOInsertData(excelData.data,pool,dealer,location,res);
       if(!insertResponse){
        insertResponse=false;
      }
      }
      else{
       insertResponse=  await tataPCBulkData.bulkPOInsertData(excelData.data,pool,null,null,res);
       if(!insertResponse){
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
      // console.log("public ip ", publicIp);
    } catch (error) {
      console.log(error, "error in lead time");
      publicIp = "Error fetching public IP";
    }
    fs.unlink(req.filePath, (err) => {
      if (err) {
        console.error('Error deleting the file:', err);
        return;
      }
      // console.log('File deleted successfully');
    });
    // console.log("rowCount ",rowCount)
    let lastinsertedId=[];
    let id;
    let insertedId;
    if(insertResponse?.poFailed){
     // console.log("res po ",insertResponse)
      id=await insertInAuditLogs(pool,req.userId,req.dealer_id,req.location,req.brand_id,publicIp,rowCount,req.fileTypeId,'Part no cannot be found ');
       insertedId=id;
       return {insertResponse,insertedId}
       
    }
    if(insertResponse?.mrnFailed){
      id=await insertInAuditLogs(pool,req.userId,req.dealer_id,req.location,req.brand_id,publicIp,rowCount,req.fileTypeId,'Part no cannot be found ');
       insertedId=id;
       return {insertResponse,insertedId}
    }
     if(!insertResponse){
      id=await insertInAuditLogs(pool,req.userId,req.dealer_id,req.location,req.brand_id,publicIp,rowCount,req.fileTypeId,'success');
     //console.log("logs inserted successfully------") 
    //  lastinsertedId.push(id);
      insertedId=id;   
     return {insertResponse,insertedId}  
    }
    if(insertResponse){
      id=await insertInAuditLogs(pool,req.userId,req.dealer_id,req.location,req.brand_id,publicIp,rowCount,req.fileTypeId,'failure');
      await delay(3000);
       insertedId=await getLastInsertedRecord(pool,req.userId)
      insertedId=id;
      
      return {insertResponse,insertedId}
    }
  
  } catch (error) {
      console.log("error in service ", error);
      // fileMissMatch=true;
      // return fileMissMatch
    }
  },
 
  deleteUploadedData:async function(req,res){
    try{
      brandId=req?.brand_id;
      userId=req?.userId;
      dealerId=req?.dealer_id;
      locationId=req?.location;
      tableNamePO='';
      tableNameMRN='';
      // fileTypeId=req.fileTypeId
      switch(brandId) {
        case 9: {
            tableNamePO = 'Mahindra_PO_file_Lead_Time_Latest_Data';
            tableNameMRN = 'Mahindra_receipt_file_lead_Time_Latest_data';
            break;
        }
        case 12: {
            tableNamePO = 'Renault_POSBO_file_lead_time_latest_data';
            tableNameMRN = 'Renault_GRN_file_lead_time_Latest_Data';
            break;
        }
        case 11: {
            tableNamePO = 'Hyundai_bo_file_lead_time_latest_data';
            tableNameMRN = 'Hyundai_Pur_File_lead_time_latest_Data';
            break;
        }
        case 32: {
            tableNamePO = 'JCB_PO_file_lead_time_latest_data';
            tableNameMRN = 'JCB_mrn_file_lead_time_latest_data';
            break;
        }
        case 33: {
            tableNamePO = 'kia_bo_file_lead_time_latest_data';
            tableNameMRN = 'kia_Pur_File_lead_time_latest_Data';
            break;
        }
        default: {
            // Optionally, handle cases where brandId doesn't match any of the above.
            
            return;
        }

        
    }
    pool=await connection.connectDB();
      let query1=`TRUNCATE TABLE ${tableNamePO}`
      let query2=`TRUNCATE TABLE ${tableNameMRN}`
       pool.request().query(query1);
       pool.request().query(query2);

    //    let query3 = `
    //    SELECT TOP 1 *
    //    FROM audit_log
    //    WHERE brandID = @brandId 
    //      AND userID = @userId 
    //      AND fileTypeID = @fileTypeId 
    //      AND error_log = 'success'`;
     
    //  if (dealerId) {
    //    query3 += ` AND dealerID = @dealerId`;
    //  }
     
    //  if (locationId) {
    //    query3 += ` AND locationID = @locationId`;
    //  }
     
    //  // Adding the ORDER BY clause at the end
    //  query3 += ` ORDER BY dateTime DESC`;
     
    //  console.log(fileTypeId);
     
    //  const requests = await pool.request()
    //    .input('brandId', brandId)
    //    .input('fileTypeId', fileTypeId)
    //    .input('userId', userId);
     
    //  if (dealerId) {
    //    results.input('dealerId', dealerId);
    //  }
     
    //  if (locationId) {
    //    results.input('locationId', locationId);
    //  }
     
    //  const results = await requests.query(query3);
     
    //  console.log("inserted id",req.insertedId)
     insertedId=req.insertedId;
        // if(results.length>0){
          // const lastInsertedId = results[0].id;
          const deleteQuery = `
         Delete from audit_log 
          WHERE id = @insertedId
          `;
      
          await pool.request().input('insertedId', req.insertedId)
          .query(deleteQuery);
          // console.log("delete successfully")
        //}
   // }
    // console.log(`Last inserted entry ID: ${lastInsertedId}`);

      //   if (results.length === 0) {
      //     console.log('No entry found for this brandId');
      //     return;
      // }
      // console.log(results[0])
    
       
        // const lastInsertedTimestamp = results[0].dateTime; // The timestamp you retrieved from the database (e.g., 1736491221000)
        // const currentTimestamp = new Date().getTime(); // Get the current timestamp in milliseconds
        
        // Create Date objects from both timestamps
        // const lastInsertedDate = new Date(lastInsertedTimestamp);
        // const currentDate = new Date(currentTimestamp);
        
        // // Normalize both dates to the same precision (to minute level)
        // lastInsertedDate.setSeconds(0); // Set seconds to 0
        // lastInsertedDate.setMilliseconds(0); // Set milliseconds to 0
        
        // currentDate.setSeconds(0); // Set seconds to 0
        // currentDate.setMilliseconds(0); // Set milliseconds to 0
        
        // console.log(lastInsertedDate.getTime(),currentDate.getTime())
        // Now compare the two timestamps (ignoring seconds and milliseconds)
        // if (lastInsertedDate.getTime() === currentDate.getTime()) {
           
        // Step 2: Delete the row with the retrieved id
       
      
     
    }
    catch(error){
      console.log("error in delete uploaded data ",error.message)
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
       

        // brandColumns=req.body.data.columns;
        // locationInfo=req.locationMaster;
        const wb = xlsx.utils.book_new();
      //   if(brandColumns.PO && brandColumns.MRN){
      //     combinedDataPo= locationInfo.map((item)=>{
      //       return{...item,
      //       ...brandColumns.PO.reduce((acc, key) => {
      //         acc[key] = null;  // Set each key's value to null
      //         return acc;
      //       }, {})
      //     }})
        
      //     combinedDataMRN= locationInfo.map((item)=>{
      //       return{...item,
      //       ...brandColumns.MRN.reduce((acc, key) => {
      //         acc[key] = null;  // Set each key's value to null
      //         return acc;
      //       }, {})
      //     }})

      //     const sheet1 = xlsx.utils.json_to_sheet(combinedDataPo);
      //     const sheet2 = xlsx.utils.json_to_sheet(combinedDataMRN);
      //   xlsx.utils.book_append_sheet(wb, sheet1, "PO Download Format");

      //  xlsx.utils.book_append_sheet(wb, sheet2, "MRN Download Format");
      //   }
      //   else{
      //     combinedDataPo= locationInfo.map((item)=>{
      //       return{...item,
      //       ...brandColumns.PO.reduce((acc, key) => {
      //         acc[key] = null;  // Set each key's value to null
      //         return acc;
      //       }, {})
      //     }})

      //     const sheet1 = xlsx.utils.json_to_sheet(combinedDataPo);
      //     xlsx.utils.book_append_sheet(wb, sheet1, "PO Download Format");
      //   }
      
      const sheet2 = xlsx.utils.json_to_sheet(req.locationMaster);
        xlsx.utils.book_append_sheet(wb, sheet2, "Workshop List");
        const buffer = xlsx.write(wb, { bookType: "xlsx", type: "buffer" });
        // console.log("Buffer created with size:", buffer.length);
        resolve(buffer);
      } catch (error) {
        console.log("error ", error.message);
        return error
        // reject(error);
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
      // console.log("res ",result)
      return result;
    }
    catch(error){
      console.log("error ",error)
    }
    

  },
 
  downloadBrandFormat:async function(req,res) {
    
    try{
      const brandId = req.brand_id;
      let filePaths = [];
    const baseFolderPath = path.join(__dirname);
    // console.log("brase folder path ",baseFolderPath)
// Generate paths dynamically for the required Excel files
switch (brandId) {
    case 9: {
      
        // Single file example
        filePaths = [path.join(baseFolderPath, 'brands-download-format', 'Mahindra MRN.xlsx'),
          path.join(baseFolderPath, 'brands-download-format','Mahindra PO.xlsx')
        ];
        // console.log(filePaths)
        break;
    }
    case 12: {
        // Two files example
        filePaths = [
            path.join(baseFolderPath,'brands-download-format', 'RENAULT GRN.xlsx'),
            path.join(baseFolderPath,'brands-download-format', 'RENAULT PO.xlsx')
        ];
        break;
    }
    case 11: {
        // Single file example
        filePaths = [path.join(baseFolderPath,'brands-download-format', 'Hyundai BO.xlsx'),
          path.join(baseFolderPath,'brands-download-format', 'Hyundai MRN.xlsx')
        ];
        break;
    }
    case 32: {
        // Single file example
        filePaths = [path.join(baseFolderPath,'brands-download-format', 'JCB MRN.xlsx'),
          path.join(baseFolderPath,'brands-download-format', 'JCB PO.xlsx')
        ];
        break;
    }
    case 33: {
        // Single file example
        filePaths = [path.join(baseFolderPath,'brands-download-format', 'KIA MRN.xlsx'),
          path.join(baseFolderPath,'brands-download-format', 'KIA BO.xlsx')
        ];
        break;
    }
    case 20: {
      // Single file example
      filePaths = [path.join(baseFolderPath, 'brands-download-format','Hero.xlsx'),
      ];
      break;
  }
  case 22: {
    // Single file example
    filePaths = [path.join(baseFolderPath,'brands-download-format', 'Honda2w.xlsx'),
    ];
    break;
}
case 17: {
  // Single file example
  filePaths = [path.join(baseFolderPath,'brands-download-format', 'TATACVBU.xlsx'),
  ];
  break;
}
case 28: {
  // Single file example
  filePaths = [path.join(baseFolderPath,'brands-download-format', 'TATAPCBU.xlsx'),
  ];
  break;
}
    default: {
        return res.status(404).send('No files available for this brand.');
    }

  }
  const zip = new AdmZip();
 if(filePaths.length==2){
   zip.addLocalFile(filePaths[0]);
   zip.addLocalFile(filePaths[1]);
 }
 else{
  zip.addLocalFile(filePaths[0]);
 }

  // Set headers to send the zip file
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename=files.zip');
//  console.log(zip)
  // Send the zip buffer as the response
  res.send(zip.toBuffer());

  // const workbook = XLSX.readFile(filePaths[0]);  
  // // Get the first sheet from the workbook
  // const worksheet = workbook.Sheets[workbook.SheetNames[0]];

  // // Convert the worksheet to JSON
  // const data = XLSX.utils.sheet_to_json(worksheet);
  // const newWorksheet = XLSX.utils.json_to_sheet(data);
  // // Create a new workbook and append the modified worksheet
  // const newWorkbook = XLSX.utils.book_new();
  // XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Sheet1');

  // const outputFilePath = 'C:\\SpareCare Solutions\\Lead Time\\Lead-Time-Backend\\lead-time-server\\services\\lead-time\\temp\\modified_excel_file.xlsx';

  // // Write the modified workbook to a file
  // XLSX.writeFile(newWorkbook, outputFilePath);
  // const buffer = xlsx.write(newWorkbook, { bookType: "xlsx", type: "buffer" });
        
  // if(filePaths.length==2){
  //   createSecondBrandFormatFile(req,res);
  // }
  // // console.log('Buffer created with size:', buffer.length);
  // return buffer

}
  catch(error){
    console.log("error in download format service",error)
    return error.message
  }

    //   if (filePaths.length === 1) {
    //     const filePath = filePaths[0];
    //     if (fs.existsSync(filePath)) {
    //         return res.download(filePath, path.basename(filePath), (err) => {
    //             if (err) {
    //                 return res.status(500).send('Error downloading the file');
    //             }
    //         });
    //     } else {
    //         return res.status(404).send('File not found.');
    //     }
    // } else {
      
    //     // If there are multiple files, zip them and send the zip file
    //    const result= await createZipAndDownload(filePaths, res);
    //    console.log("result in downlod brand format ",result)
    //   //  return result
    // }

  
  
  }
,
  getUploadLogs:async function(req){
    try{

      const pool=await connection.connectDB();
      let brandId = req.brand;
      let dealerId = req?.dealer;
      let locationId = req?.location;
      let userId=req.userId
      console.log("dealer ",dealerId,locationId)
      
      let query = `SELECT userID, brandID, dealerID, locationID, dateTime, noOfRecords ,fileTypeID
                   FROM Audit_Log 
                   WHERE brandID = @brandId and operation='upload' and userID=@userId and error_log='success' `;
      
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
    query+=` order by dateTime desc`
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
            acc[header] = cleanRowData(row[index],header); // Clean the data values as well
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
        if (typeof str === "number" && !isNaN(str)) {
          // Excel serial numbers typically start from 25569 (January 1, 1900)
          const excelEpoch = 25569;  // Excel date system starts on January 1, 1900
          const validExcelSerialRange = (str >= excelEpoch && str <= 999999);  // A reasonable upper limit for dates
      
          if (validExcelSerialRange) {
            const excelDate = new Date((str - excelEpoch) * 86400 * 1000);  // Convert to JavaScript Date
            return excelDate; 
          } else {
            // If it's a number but not a valid date serial number, treat it as a quantity
            str+=''
            return str;  // Return the number as is (for quantities)
          }
        }
     
        convertedStr = String(str).replace(/'/g, "");
        // console.log("converted str ",str)
        convertedStr = String(str)
        if (header == "location" || header=='dealer') {
          // console.log(convertedStr)
          return convertedStr.trim();  // Return the string as is for 'dealer location'
      }
      else{
            convertedStr= convertedStr.replace(/[^a-zA-Z0-9\s]/g, "")
      }
        return convertedStr.trim();
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
async function createSecondBrandFormatFile() {
  
}
async function   getLastInsertedRecord(pool,userId){

  try{
    let query=`SELECT TOP 1 *
FROM Audit_log
WHERE userID = @userId  
ORDER BY dateTime DESC;  
`
    const result=await pool.request().input('userId',userId).query(query);
    console.log("result in get last inserted record",result)
    id=result[0].id;
    return id;
  }
  catch(error){
    console.log("error in get last inserted ",error.message)
  }
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

const createZipAndDownload = async (filePaths, res) => {
  try {
  

    // Define the path for the temporary ZIP file
    const outputZipPath = path.join(__dirname, 'target1.zip');
    const output = fs.createWriteStream(outputZipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    // Pipe the archive to the output file
    // archive.pipe(output);

   

//  archive.directory(path.join(__dirname, 'source_dir'), false); // No subdirectory in archive, files go to root
//     archive.directory(path.join(__dirname, 'subdir'), 'new-subdir'); // Files from 'subdir' go into 'new-subdir'
    // Once the archive is finalized and the file is created, send it to the client
    output.on('close', function () {
  
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename=target1.zip');

      // Send the file as a response
      fs.createReadStream(outputZipPath).pipe(res);
       res.download(output)
      console.log(archive.pointer() + ' total bytes');
      console.log('archiver has been finalized and the output file descriptor has closed.');
    });
    fs.createReadStream(outputZipPath).pipe(res).
     // Add files to the archive
     res.attachment('target1.zip'); // Triggers download in the browser

  // // Pipe the archive data to the response
  // archive.pipe(res);

  // Add files to the archive
  filePaths.forEach((filePath) => {
    const absolutePath = path.resolve(filePath);
    try {
      fs.accessSync(absolutePath, fs.constants.R_OK);  // Check read permissions
      archive.append(fs.createReadStream(absolutePath), { name: path.basename(filePath) });
    } catch (err) {
      console.error(`File not accessible: ${absolutePath}`, err);
      // Handle error, maybe return an error response to the client
    }
  });
  
   
 // Finalize the archive (this will create the ZIP file)
 archive.finalize();
    // Handle errors during the archiving process
    archive.on('error', function (err) {
      console.error('Error while creating zip:', err);
      return res.status(500).send('Error while creating zip file.');
    });
   
  } catch (error) {
    console.error('Error in createZipAndDownload:', error);
    return res.status(500).send('An error occurred while preparing the zip file.');
  }
};
// const createZipAndDownload = async (filePaths, res) => {
//   try {
//     // Set up a stream for the ZIP file
//     // console.log(filePaths)
//     const archive = archiver('zip', { zlib: { level: 9 } });

   

//     // // Log file paths being added to the zip
//     // console.log("Adding the following files to zip:", filePaths);

//     // Add each file to the zip archive
//     filePaths.forEach((filePath) => {
//       const absolutePath = path.resolve(filePath);  // Resolves the absolute path
//       // console.log(`Checking if file exists: ${absolutePath}`);

//       try {
//         fs.accessSync(absolutePath, fs.constants.R_OK);  // Check read permissions
//         archive.file(absolutePath, { name: path.basename(filePath) });
//         // console.log(`Added file: ${absolutePath}`);
//       } catch (err) {
//         console.error(`File not accessible: ${absolutePath}`, err);
//       }
//     });

//     // Finalize the archive (this will trigger the download)
//     var output = fs.createWriteStream('target.zip');
//     // var archive = archiver('zip');
//     const outputZipPath = path.join(__dirname, 'Lead_Time_Files.zip');
//     output.on('close', function () {
//       res.setHeader('Content-Type', 'application/zip');
//       res.setHeader('Content-Disposition', 'attachment; filename=Lead_Time_Files.zip');
      
//       // Send the file as response
//       fs.createReadStream(outputZipPath).pipe(res);
//         console.log(archive.pointer() + ' total bytes');
//         console.log('archiver has been finalized and the output file descriptor has closed.');
//     });
//     //  // Pipe the archive output directly to the response
//     //  archive.pipe(res);
//     archive.on('error', function(err){
//         throw err;
//     });
    
//     // archive.pipe(output);
    
//     // append files from a sub-directory, putting its contents at the root of archive
//     archive.directory(path.join(__dirname, 'source_dir'), false); // No subdirectory in archive, files go to root
// archive.directory(path.join(__dirname, 'subdir'), 'new-subdir'); // Files from 'subdir' go into 'new-subdir'

    
//     archive.finalize();
    

//   } catch (error) {
//     console.error('Error in createZipAndDownload:', error);
//     return res.status(500).send('An error occurred while preparing the zip file.');
//   }
// };

async function insertInAuditLogs(pool,userId,dealer_id,location,brand_id,publicIp,rowCount,fileTypeId,error_status){
  // console.log(rowCount)
  try{
    pool=await connection.connectDB();
    const utcDate = new Date();
    const indiaOffset = 5.5 * 60; // IST is UTC+5:30
    const indiaTime = new Date(utcDate.getTime() + indiaOffset * 60000);
    // let query2 = `Insert into Audit_log(userID,dealerID,brandID,locationID,dateTime,operation,IP,noOfRecords,fileTypeID,error_log)
    //  values(@userId,@dealer_id, @brand_id, @location,@indiaTime,@operation,@publicIp,@rowCount,@fileTypeId,@error_status)`;
  
    // console.log("indeiaTime",indiaTime)
    let query2 = `
      INSERT INTO Audit_log(userID, dealerID, brandID, locationID, dateTime, operation, IP, noOfRecords, fileTypeID, error_log)
      OUTPUT INSERTED.ID  -- This returns the inserted ID
      VALUES (@userId, @dealer_id, @brand_id, @location, @indiaTime, @operation, @publicIp, @rowCount, @fileTypeId, @error_status)
    `;
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
    .input('error_status',error_status)
      .query(query2);
  
      //console.log(result1)
      const insertedId = result1[0].ID;  // Adjust based on the column name, e.g., 'ID' or 'Audit_log_ID'
  
      // console.log(`Logs inserted successfully. Inserted ID: ${insertedId}`);
      return insertedId;
      // console.log("logs inserted succesfully----")
  }
  catch(error){
    console.log("error in audit log upload ",error.message)
  }
 
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
    if(dealer!=null && location!=null){
      if(headerRow.includes('dealer') && headerRow.includes('location')){
        console.log("excuting")
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
      }else{
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
          acc[header] = cleanRowData(row[index],header); // Clean the data values as well
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
   
    function cleanRowData(str,header) {
      if (str === undefined || str === null) {
        return null;  // Replace undefined or null with a database-friendly null
      }

      if (typeof str === "number" && !isNaN(str)) {
        // Excel serial numbers typically start from 25569 (January 1, 1900)
        const excelEpoch = 25569;  // Excel date system starts on January 1, 1900
        const validExcelSerialRange = (str >= excelEpoch && str <= 999999);  // A reasonable upper limit for dates
    
        if (validExcelSerialRange) {
          const excelDate = new Date((str - excelEpoch) * 86400 * 1000);  // Convert to JavaScript Date
          return excelDate; 
        } else {
          // If it's a number but not a valid date serial number, treat it as a quantity
          str+=''
          return str;  // Return the number as is (for quantities)
        }
      }
    
     
     // convertedStr = String(str).replace(/'/g, "");
      convertedStr = String(str)
    if (header == "location" || header=='dealer') {
      // console.log(convertedStr)
      return convertedStr.trim();  // Return the string as is for 'dealer location'
  }
  else{
        convertedStr= convertedStr.replace(/[^a-zA-Z0-9\s]/g, "")
  }
    if(str<0 )
      {
        str=0;
      }
   // Remove all non-alphanumeric characters and symbols
      // Remove leading/trailing spaces
      return convertedStr.trim()
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
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}




// module.exports={readExcelFile1}

// async function getFileTypeBasedOnBrand(req){
//   console.log("res ",req)
// }