const config = require("../../dbConfig");
const sql = require("mssql");
const connection=require('../../connection')
module.exports = {
  getLocationsBasedOnBrand: async function (req) {
    try {
      const pool = await sql.connect(config);
      console.log("Connected to the database successfully!");
      // Begin a transaction for inserting data
      const transaction = new sql.Transaction();
      await transaction.begin();
      brand_id = req.brand_id;
      dealer_id = req.dealer_id;
      const request = new sql.Request(transaction);
      const query = `
         Select locationID as Location_id,location as Location_name from z_scope.dbo.locationInfo where dealerID=@dealer_id and status=1
        `;

      // Execute the insert query for each row
      const result = await pool
        .request()
        .input("brand_id", brand_id)
        .input("dealer_id", dealer_id)
        .query(query);

      // console.log("result ",result.recordset)
      // Commit the transaction
      await transaction.commit();
      // console.log("result ",result.recordset)
      

      return result.recordset;
    } catch (err) {
      console.log("error in fetching data", err.message);
      await transaction.rollback();
    } 
  },

  getLocations: async function (req) {
    try {
      const pool = await sql.connect(config);
      console.log("Connected to the database successfully!");
      // Begin a transaction for inserting data
      const transaction = new sql.Transaction();
      await transaction.begin();
      dealer_id = req.dealer_id;
      const request = new sql.Request(transaction);
      const query = `
     Select locationID as location_id,location as location_name from z_scope.dbo.locationInfo where dealerID=@dealer_id and status=1
    `;

      // Execute the insert query for each row
      const result = await pool
        .request()
        .input("dealer_id", dealer_id)
        .query(query);

      // console.log("result ",result.recordset)
      // Commit the transaction
      await transaction.commit();
      console.log("Data fetched successfully.");
      //   console.log("result ",result.recordset);

      return result.recordset;
    } catch (err) {
      console.log("error in fetching data", err.message);
      await transaction.rollback();
    }
  },

  getLocationMaster: async function (req) {
    try {
      brandId=req.brand_id;
      console.log(brandId)
     const pool=await connection.connectDB()
  //     const query = `
     
  // select b.brand,c.dealer_name,a.location_name
  // from z_scope.dbo.Location_Master a 
  // inner join z_scope.dbo.Brand_Master b on a.brand_id=b.brand_id
  // inner join z_scope.dbo.Dealer_Master c on a.dealer_id=c.dealer_id 
  // where a.brand_id=@brandId
  //   `;
    const query=` select b.vcbrand,c.vcName,a.location
  from z_scope.dbo.locationInfo a 
  inner join z_scope.dbo.Brand_Master b on a.brandID=b.bigid
  inner join z_scope.dbo.Dealer_Master c on a.dealerID=c.bigid
  where a.brandID=@brandId and where status=1
    `;

      // Execute the insert query for each row
      const result = await pool
        .request().input('brandId',brandId)
        .query(query);
      // console.log("result ",result)
      return result;
    } catch (err) {
      console.log("error in fetching data", err.message);
      await transaction.rollback();
    }
  },
};
