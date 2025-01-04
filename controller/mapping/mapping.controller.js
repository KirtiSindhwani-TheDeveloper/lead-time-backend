const mappingService=require('../../services/mapping/mapping.service')
module.exports={
    uploadFile:async function(req,res) {
        
        try{

        const filePath = req.file.path;  
        // console.log(filePath)
        // Call service to process the uploaded Excel file
        const result = await mappingService.readExcelFile(filePath);
           
        // Send back the data to the client
        res.json({ message: 'File processed successfully', data: result.headers ,data1:result.data ,filePath:filePath });
      } catch (error) {
        console.error('Error in controller:', error);
        res.status(500).json({ error: 'Failed to process the Excel file' });
      }
    
},
    mappedColumns:async function(req,res){
        try{
            // console.log("req ",req)
            const result=await mappingService.mappedColumns(req.body);
            res.status(201).json({data:result})
        }
        catch(err){
            res.status(200).json({ error: 'Data is not mapped successfully' });
        }
}
}