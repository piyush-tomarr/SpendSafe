const { handle_wallet, get_wallet, getWalletForDebit, debitAmount, insertTransaction, transactionFailed, transactionSuccess, creditAmount, getTransactionHistory } = require("./wallet.service")
const {pool} = require('../../db')
module.exports= {
    handleWallet:async (req,res)=>{
        const data = req.body
        try{

        const response  = await handle_wallet(data)
        return res.status(200).json({msg:"Amount Added Successfully" ,response:response})
        }
        catch(error){
            return res.status(500).json({msg:"Something went wrong while while adding amount", err:error})
        }
    },
        
    getWallet: async (req,res)=>{
        const {user_id} = req.query
               if (!user_id) {
            return res.status(400).json({ msg: "user_id is required" })
    }
        console.log(user_id)
        try{
     
               const response =  await get_wallet(user_id)
               const responseData  = response[0]
                 if(response.length===0){
                    return res.status(204).json({msg:"No Wallet Found"})
                 }
                 else{
                    return res.status(200).json({msg:"Success", data:responseData})
                 }
        }
        catch(error){
               return res.status(500).json({msg:'Some Error Occured', error:error})
        }
    },


 debitMoney:async (req,res)=>{
    const {user_id} = req.params
    const{amount}=req.body
    const{request_id} = req.body
    // const{transaction_type} = req.body
    const conn = await pool.getConnection()
     try{
      if (!amount || isNaN(amount)) {
           
            return res.status(400).json({msg: "Invalid debit amount"})
                 }
          await conn.beginTransaction()

           

          const response=  await insertTransaction(conn,user_id,amount,request_id,'debit')
          console.log(response)
          if(response.response_type==='previous'){
            await conn.commit()
            return res.status(200).json({msg:response.message})
          }

          const user_amount = await getWalletForDebit(conn,user_id)
         

          if(user_amount.length===0){
           await  transactionFailed(conn, request_id,user_id)
             await conn.commit()
            return res.status(404).json({msg: "Wallet Not Found"})
           
          }

          if(user_amount[0].total_amount<amount){
                      await  transactionFailed(conn, request_id,user_id)

             await conn.commit()
            return res.status(400).json({msg:'Insufficient Funds'})
           
          }
         
          await debitAmount(conn,user_id,amount)
        await   transactionSuccess(conn,request_id,user_id)
          await conn.commit()
          return res.status(200).json({msg:'Amount debited successfully'})
     }
     catch(error){
           await conn.rollback()
           return res.status(500).json({msg:"Server Error",error:error})
     }
     finally{
        conn.release()
     }
     },

     creditMoney:async(req,res)=>{
      const {user_id} = req.params
      const {request_id,amount}=req.body
      let conn = await pool.getConnection()
      try{
        if(!amount || isNaN(amount)){
          return res.status(400).json({msg:'Invalid credit ammount'})
        }
          await conn.beginTransaction()

          const result = await insertTransaction(conn,user_id,amount,request_id,'credit')
          if(result.response_type==='previous'){
           await  conn.commit()
            return res.status(200).json({msg:result.message})
          }
       
          
           
         const creditResult =  await creditAmount(conn,user_id,amount)
         if(creditResult.affectedRows ===0){
          await transactionFailed(conn,request_id,user_id)
          await conn.commit()
          return res.status(404).json({mgs:'No wallet found'})
         }
          await transactionSuccess(conn,request_id,user_id)
        await conn.commit()
          return res.status(200).json({msg:'Transaction Successful'})
        
      }
      catch(error){
        
          await conn.rollback()
          return res.status(500).json({msg:error})
      }
      finally{
        conn.release()
      }
     },


     transaction_History:async(req,res)=>{
      const {user_id} = req.params
      try{
          const transaction_history=await getTransactionHistory(user_id)
          const history = transaction_history
          if(transaction_history.length===0){
            return res.status(404).json({msg:'No Transaction Found'})
          }
          return res.status(200).json({msg:'success',data:transaction_history})
      }
      catch(error){
        return res.status(500).json({msg:"error",error:error})
      }
     }
 }



