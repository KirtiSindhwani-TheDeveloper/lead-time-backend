const config=require('../../dbConfig')
const sql=require('mssql');
module.exports={
    getBrands:async function(){
        try{
            const pool = await sql.connect(config);
      console.log('Connected to the database successfully!');
      // Begin a transaction for inserting data
      const transaction = new sql.Transaction();
      await transaction.begin();
  
      const request = new sql.Request(transaction);
      const query = `
         Select DISTINCT brandID AS brand_id, Brand AS brand from z_scope.dbo.locationInfo where brandStatus=1
        `;
  
        // Execute the insert query for each row
       const result= await pool.request()
          .query(query);
      
  
      // Commit the transaction
      await transaction.commit();
      console.log('Data fetched successfully.');
      
      return result.recordset
        }
        catch(err){
            console.log("error in fetching data",err.message);
            await transaction.rollback(); 
        }
        
    }
}