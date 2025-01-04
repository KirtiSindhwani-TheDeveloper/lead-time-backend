const config=require('../../dbConfig')
const sql=require('mssql');
module.exports={
    getDealersBasedOnBrandID:async function(req){
        try{
            const pool = await sql.connect(config);
      console.log('Connected to the database successfully!');
      // Begin a transaction for inserting data
      const transaction = new sql.Transaction();
      await transaction.begin();
  
      // Prepare the SQL query for inserting data into SIMS_STOCK_FILE
      brand_id=req.brand_id;
      const request = new sql.Request(transaction);
      const query = `
         Select dealer_id,dealer_name from Dealer_Master where brand_id=@brand_id;
        `;
  
        // Execute the insert query for each row
       const result= await pool.request()
       .input('brand_id',brand_id)
          .query(query);
      
        //   console.log("result ",result.recordset)
      // Commit the transaction
      await transaction.commit();
    //   console.log('Data fetched successfully.');
    //   console.log("result ",result.recordset);
      
      return result.recordset 
        }
        catch(err){
            console.log("error in fetching data",err.message);
            await transaction.rollback(); 
        }
        
    }
}