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



    getWalletForDebit:async(conn,user_id)=>{
      const [Amount] = await conn.query(process.env.GET_WALLET_FOR_DEBIT,[user_id])
     
      return Amount
    },

    debitAmount:async(conn,user_id,amount)=>{
        await conn.query(process.env.DEBIT_AMOUNT_FROM_WALLET,[amount,user_id])
    },
    
    creditAmount:async(conn,user_id,amount)=>{
         const [result] =  await conn.query(process.env.CREDIT_AMOUNT_TO_WALLET,[amount,user_id])
         return result
    },
         
    insertTransaction:async(conn,user_id,amount,request_id,transaction_type)=>{
      try{
            await conn.query(process.env.INSERT_INTO_TRANSACTIONS,[user_id,amount,transaction_type,request_id, JSON.stringify({"message":"Transaction Pending"})])
            return {
              success:true,
              response_type:"new",
              message:'Transaction Processing'
            }
      }
      catch(error){
        
        if(error.code ==='ER_DUP_ENTRY'){
           const [rows]= await conn.query(process.env.PREVIOUS_RESPONSE,[user_id,request_id])

           return{
            success:true,
            response_type:"previous",
            message:rows[0].response_json?.message

           }
        }
         return error
      }
    },

    transactionFailed:async(conn,request_id,user_id)=>{
             await conn.query(process.env.TRANSACTION_FAILED,[JSON.stringify({"message":"Transaction Failed"}),request_id,user_id])
    },
    transactionSuccess:async(conn , request_id,user_id)=>{
           await conn.query(process.env.TRANSACTION_SUCCESS,[JSON.stringify({"message":"Transaction Successful"}),request_id,user_id])
    },




     getTransactionHistory:async(user_id)=>{
      const transaction_history = await pool.query(process.env.GET_TRANSACTION_HISTORY,[user_id])
      return transaction_history[0]
     }
}

