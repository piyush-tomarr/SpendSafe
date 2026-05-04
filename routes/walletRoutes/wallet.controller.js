const { handle_wallet, get_wallet, debitAmount, insertTransaction, transactionFailed, transactionSuccess, creditAmount, getTransactionHistory, checkifSameTransaction, fetchWallet, insertTransactions, initialInsert, updateTransactionStatus, debit_amount, credit_amount, fetchBudget } = require("./wallet.service")
const {pool} = require('../../db')
const {z, success} = require('zod')
const { transactionSchema } = require("./Validators/Transaction.schema")

module.exports= {
    handleWallet:async (req,res)=>{
        const data = req.body
        try{
         if(!data.id)return res.status(400).json({success:false , message:"Id is required"})
         if(!data.amount)return res.status(400).json({success:false , message:"Amount is required"})
         if(data.amount===0)return res.status(400).json({success:false , message:"Amount can't be 0"})

        const response  = await handle_wallet(data)
        return res.status(200).json({success:true , message:'Amount Added Successfully'})
        }
        catch(error){
          console.log(error)
            return res.status(500).json({success:false , message:'Error Adding Amount'})
        }
    },
        
    getWallet: async (req,res)=>{
        const {user_id} = req.query
               if (!user_id) {
            return res.status(400).json({success:false , message:'A valid user id required ' })
    }
        
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
      const { startDate, endDate } = req.query;
       if (!startDate || !endDate) {
    return res.status(400).json({ msg: 'startDate and endDate are required' });
  }
      try{
          

          const transaction_history=await getTransactionHistory(user_id,startDate , endDate)
          
          if(transaction_history.length===0){
            return res.status(404).json({msg:'No Transaction Found'})
          }
          return res.status(200).json({msg:'success',data:transaction_history})
      }
      catch(error){
        return res.status(500).json({msg:"error",error:error})
      }
     },



     walletForecastController:async(req,res)=>{
         const {user_id} = req.params
        if(!user_id){
          return res.status(400).json({success:false , message:"user_id is required"})
        }
         let conn;
         try{
          conn= await pool.getConnection()
              let wallet = await fetchWallet(conn , user_id)
              let budget = await fetchBudget(conn, user_id)
            if(wallet.length===0 || budget.length===0){
              return res.status(404).json({success:false, message:"you need to set up Wallet and budget first"})
            }

            let daysRemaining, weeksRemaining, runoutDate
              if(budget[0].budget_type==='daily'){
                let dailybudget = budget[0].budget
                 daysRemaining = Math.floor(wallet[0].total_amount / dailybudget)
                 runoutDate =   new Date()
                runoutDate.setDate(runoutDate.getDate()+daysRemaining)
              }
               if(budget[0].budget_type==='weekly'){
                let weeklyBudget = budget[0].budget
                let dailybudget = budget[0].budget/7
                 daysRemaining = Math.floor(wallet[0].total_amount / dailybudget)
                 weeksRemaining =  Math.floor(wallet[0].total_amount / weeklyBudget)
                 runoutDate =   new Date()
                runoutDate.setDate(runoutDate.getDate()+daysRemaining)
              }
              let response = {
                budget_type:budget[0].budget_type,
                daysRemaining,
                weeksRemaining,
                runoutDate
              }
              return res.status(200).json({success:true , data:response})
         }
         catch(error){
            return res.status(500).json({success:false,message:"internal server error"})
         }
         finally{
          conn.release()
         }

     }
 }



