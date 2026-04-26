const { handle_wallet, get_wallet, debitAmount, insertTransaction, transactionFailed, transactionSuccess, creditAmount, getTransactionHistory, checkifSameTransaction, fetchWallet, insertTransactions, initialInsert, updateTransactionStatus, debit_amount, credit_amount } = require("./wallet.service")
const {pool} = require('../../db')
const {z} = require('zod')
const { transactionSchema } = require("./Validators/Transaction.schema")
module.exports= {
    handleWallet:async (req,res)=>{
        const data = req.body
        try{

        const response  = await handle_wallet(data)
        return res.status(200).json({success:true , message:'ammount added successfully'})
        }
        catch(error){
            return res.status(500).json({success:false , message:'Error Adding Amount'})
        }
    },
        
    getWallet: async (req,res)=>{
        const {user_id} = req.query
               if (!user_id) {
            return res.status(400).json({success:false , message:'A valid user id required ' })
    }
        console.log(user_id)
        try{
     
               const response =  await get_wallet(user_id)
               const responseData  = response[0]
                 if(response.length===0){
                    return res.status(404).json({success:false , message:' no wallet found'})
                 }
                 else{
                    return res.status(200).json({success:true, data:responseData})
                 }
        }
        catch(error){
          console.log(error)
               return res.status(500).json({success:false , message:'Internal server error'})
        }
    },


   //new TransactionController
   
    transactionContoller: async(req,res)=>{
      let {user_id}=req.params;
      if(!user_id){
        return res.status(403).json({success:false,message:'Invalid user id'})
      }
      let val_result= transactionSchema.safeParse(req.body)
      if(!val_result.success){
        return res.status(400).json({success:false, error:val_result.error.issues[0].message})
      }

      let{amount,transaction_type,request_id,category,note} = val_result.data

     
      let conn
      try{
         conn = await pool.getConnection()
         await conn.beginTransaction()
          const checkifSame = await checkifSameTransaction(conn,user_id,request_id)
          if(checkifSame.length>0){
            await conn.commit()
            return res.status(200).json({success:true, message:checkifSame[0].response_json.message})
          }

          const userWallet= await fetchWallet(conn,user_id)
           console.log(userWallet)
          
            if(userWallet.length===0){
              await conn.rollback()
              return res.status(403).json({success:false, message:'Wallet not found ! Please create one to continue transactions'})
            }
            await initialInsert(conn,user_id,amount,transaction_type,request_id,'pending',category,note)
         if(transaction_type==='debit'){
            
            if(userWallet[0].total_amount<amount){
              
              let response={success:false, message:"Insufficient Funds"}
              await updateTransactionStatus(conn,'failed',user_id,request_id,response)
              await conn.commit()
              return res.status(403).json(response)
            }
             await debit_amount(conn,user_id,amount)
         }

          if(transaction_type==='credit'){
            await credit_amount(conn,user_id,amount)
          }

          
              let response={success:true, message:"Transaction Successful"}
              await updateTransactionStatus(conn,'success',user_id,request_id,response)
              await conn.commit()
              return res.status(200).json(response)

      }


      catch(error){
        console.log(error)
        if(conn) await conn.rollback()
          return res.status(500).json({success:false, message:"Internal Server Error"})
      }


      finally{
        if(conn) conn.release()
      }
    },


     transaction_History:async(req,res)=>{
      const {user_id} = req.params
      try{
          const transaction_history=await getTransactionHistory(user_id)
          
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



