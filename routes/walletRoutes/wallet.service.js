const { pool } = require("../../db")

module.exports={
    handle_wallet:async (data)=>{
        let connection
        try{
          connection  = await pool.getConnection()
          await connection.beginTransaction()
          const [users]= await connection.query(process.env.SELECT_WALLET_DETAILS,[data.id])
          let response
          if(users.length>0){
            response = await connection.query(process.env.UPDATE_WALLET,[data.amount,data.id])
          }
          else{
            response = await connection.query(process.env.ADD_NEW_WALLET,[data.id,data.amount])
          }
          await connection.commit()
          return response
        }
        catch(error){
            if (connection)await connection.rollback()
            throw (error)
        }
        finally{
            if(connection) connection.release()
        }
    },

    get_wallet: async(user_id)=>{
      const [data] = await pool.query(process.env.SELECT_WALLET_DETAILS,[user_id])
      console.log(data)
      // const wallet_data = data[0]
      // return wallet_data;
      return data
    },
     getTransactionHistory:async(user_id)=>{
      const transaction_history = await pool.query(process.env.GET_TRANSACTION_HISTORY,[user_id])
      return transaction_history[0]
     },



    //new functions!------------------------------------------------------------------------------

    checkifSameTransaction:async(conn,user_id,request_id)=>{
      let query= 'SELECT * FROM tbl_transactions WHERE user_id =? AND request_id=?'
      const [rows] = await conn.query(query,[user_id,request_id])
      return rows

    },

    fetchWallet:async(conn,user_id)=>{
      console.log(user_id)
      let query='SELECT * FROM tbl_wallet WHERE user_id=? FOR UPDATE'
      const [rows] = await conn.query(query,[user_id])
      console.log(rows)
      return rows
    },

     initialInsert: async(conn,user_id,amount,transaction_type,request_id,status,category,note)=>{
     

    let response={ message: "Transaction pending" };

    let query='INSERT INTO tbl_transactions(user_id,amount,transaction_type,request_id,STATUS,response_json,category,note) VALUES(?,?,?,?,?,?,?,?)'
    await conn.query(query,[user_id,amount,transaction_type,request_id,status,JSON.stringify(response),category,note])
   },


   updateTransactionStatus: async(conn,status,user_id,request_id ,response)=>{
      const query=' UPDATE tbl_transactions SET STATUS=? , response_json=? WHERE user_id=? AND request_id=?'
      await conn.query(query,[status,JSON.stringify(response),user_id,request_id])
   },
 

   debit_amount:async(conn,user_id,amount)=>{

    let query='UPDATE tbl_wallet SET total_amount = total_amount - ? WHERE user_id = ?'
        await conn.query(query,[amount,user_id])
    },

    credit_amount:async(conn,user_id,amount)=>{

      let query='UPDATE tbl_wallet SET total_amount = total_amount+? WHERE user_id = ?'
         await conn.query(query,[amount,user_id])
         
    },

   

}

