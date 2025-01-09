const { stat } = require("fs");
const leadTimeService = require('../../services/lead-time/lead-time.service');
const mappingService=require('../../services/mapping/mapping.service');
const locationService=require('../../services/utilites/location.service')
const fs=require('fs')
module.exports = {
  addColumns: async function (req, res) {
    try {
     
      const result = await leadTimeService.addColumns(req.body);
      res.status(200).send({ data: result ,status:200});
    } catch (error) {
      res.status(201).send({ error: "Not Inserted" });
    }
  },

  mappingExist:async function(req,res){
    try{
      const res=await leadTimeService.mappingExist(req.body)
      res.send({data:res,status:200});

    }
    catch(error){
      res.status(201).json({error:error.message})
    }
   
  },
  editColumns: async function (req, res) {
    try {
      const result = await leadTimeService.updateColumns(req.body);
      res.status(200).send({ data: result });
    } catch (error) {
      res.status(201).send({ error: "Not Inserted" });
    }
  },
  getRecords: async function (req, res) {
    try {
      // console.log("req ",req.body)
      const result = await leadTimeService.fetchColumns(req.body);
      res.status(200).send({ data: result });
    } catch (error) {
      res.status(201).send({ error: "Not Inserted" });
    }
  },

  exportData: async function (req, res) {
    const data = req.body; // Data sent from the frontend

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ message: "Invalid or empty data" });
    }

    try {
      // Generate the Excel file (buffer)
      const excelFile = await leadTimeService.generateExcelFile(data);

      // Set the response headers to indicate a downloadable file
      res.setHeader("Content-Disposition", "attachment; filename=export.xlsx");
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      // Send the Excel file as a response
      res.send(excelFile);
    } catch (error) {
      console.error("Error generating Excel file:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  getUploadedData: async function (req, res) {
    try {
     
            const result = await leadTimeService.getUploadedDataDetails(req.body);
                  res.status(200).send({ data: result ,status:200});
    } catch (error) {
      res.status(201).send({ error: "Not fetched" });
    }
  },

  exportMultiSheetData: async function (req, res) {
    try {
      // console.log("req.body ",req.body)
      const fileTypes = req.body.fileType;
      const data=await leadTimeService.getExportFileTypeData(req.body,res);

     //console.log("data",data)
      const fileBuffer = await leadTimeService.createExcelFile(
       data,fileTypes
      );

      // const fileBuffer1=await leadTimeService.createLogsFile(data,res);
      
 
      // Send file as response
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=multi_sheets.xlsx"
      );
      // res.setHeader("Content-Type", "application/json");
     res.send(
     fileBuffer)
   
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error generating Excel file", error: error.message });
    }
  },

  exportLogMultisheetData:async function (req,res) {
    try{
    const data=await leadTimeService.getExportFileTypeData(req.body,res);


    const fileBuffer1=await leadTimeService.createLogsFile(data,res);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=multi_sheets.xlsx"
    );
    res.send(fileBuffer1)}catch (error) {
      res
        .status(500)
        .json({ message: "Error generating Excel file", error: error.message });
    }
  },

  uploadData: async function (req, res) {
  let data;
    try{
      // Example of setting correct headers
res.setHeader('Content-Type', 'application/json');

        //  console.log("req.file.path",req)
         data=await mappingService.readExcelFile(req.body.filePath)
        //  console.log("data ",data.headers);
          
            try {
               
                  const result = await leadTimeService.uploadData(req.body, data,res);
                  console.log("res ",result)
                  res.status(200).send({ data: result});

                
            } catch (error) {
                res.status(500).send({ error: "Error uploading data: " + error.message });
            }


    }
    catch(error){
        console.log("error ",error.message)
    }
   
  },

  deleteUploadedData:async function(req,res){
    try{
      await leadTimeService.deleteUploadedData(req.body);
      res.status(200).send({message:'Delete successfully'})
    }
    catch(error){
      res.status(201).send({message:error.message})
    }
  },

  readSubHeader:async function (req,res) {

    try{
      // console.log("filePtah",req)
      const result=await leadTimeService.readExcelFile(req.body.filePath);
      return res.send({status:200,data:result})
    }
    catch(error){
      res.status(201).send({message:error.message})
    }
  },
  downloadFormat:async function(req,res) {
    try {

      // console.log(req.body);
      const data=await locationService.getLocationMaster(req.body);
      // console.log("data ",data)
      const result = await leadTimeService.downloadFormat({body:req.body,locationMaster:data});
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=multi_sheets.xlsx"
      );
      res.send(result);
      // res.status(200).send({ data: result });
    } catch (error) {
      res.status(201).send({ error: "Not fetched" });
    }
  },

  getFileTypes:async function(req,res){
    try {
      // console.log(req.body);
      const result = await leadTimeService.getFileTypeBasedOnBrand(req.body);
      res.status(200).send({ data: result });
    } catch (error) {
      res.status(201).send({ error: error.message});
    }
  },
  getUploadLogs:async function(req,res){
      try{
        const result=await leadTimeService.getUploadLogs(req.body)
          res.status(200).send({data:result})
      }
      catch(error){
        res.status(201).send({error:"Uploaded Logs are not fetched"})
      }
  }
};


