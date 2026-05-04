const { response } = require("../../app")
const { checkBudgetExists, updateBudget, add_Budget, get_budget, dailyexpanseService, weeklyexpanseService, getUserWallet, weeklyExpanseService } = require("./budget.service")
const {addBudgetSchema} = require("./Validators/AddBudget.schema")

module.exports={
    addBudget:async(req,res)=>{

       
        let result = addBudgetSchema.safeParse(req.body)
   
        if(!result.success){
          return res.status(400).json({success:false , message:result.error.issues[0].message})
        }
      
        let {user_id,budget,budget_type} = result.data
          try{
         
           let userWallet = await getUserWallet(user_id)
            if(userWallet.length===0){
            return res.status(422).json({success:false , message:'You need to set up your wallet first'})
           }

           if(userWallet[0].total_amount<budget){
            return res.status(422).json({success:false , message:'Budget can not exceed the amount in the wallet'})
           }
            
             const budgetExixts = await checkBudgetExists(user_id)
           if(budgetExixts.length===0){
             await add_Budget(user_id,budget,budget_type)
                return res.status(200).json({success:true , message:"Budget set successfully" })
           }
           else{
            await  updateBudget(user_id,budget,budget_type)
            return res.status(200).json({success:true , message:"Budget Updated successfully"})
           }
             
          }
          catch(error){
            console.log(error)
             return res.status(500).json({success:false , message:"Internal Server Error"})
          }
    },

    getBudget:async(req,res)=>{
       const {user_id} = req.query
           if(!user_id) return res.status(400).json({success:false , message:"missing user id"})
          try{
              const [userBudget] = await get_budget(user_id)
              if(userBudget.length===0){
                return res.status(404).json({success:false , message:"Budget Not found! please create one "})
              }
              else{
                       return res.status(200).json({success:true, result:userBudget })
              }
          }
          catch(error){
            console.log(error)
            return res.status(500).json({success:false , message:"Internal Server Error"})
          }

    },


    budgetAlertController: async(req,res)=>{
      const {user_id,budget_type }=req.params
           if(!user_id) return res.status(400).json({success:false , message:"missing user id"})
      if(!budget_type) return res.status(400).json({success:false , message:"missing budget type"})
     if(budget_type!=='daily' && budget_type!=='weekly'){
      return res.status(400).json({success:false , message:"Invalid Budget Type"})
     }
   
     try{
      
      
      if(budget_type==='daily'){
        const response = await dailyexpanseService(user_id)
         return res.status(200).json({success:true,response:response})
      }
       if(budget_type==='weekly'){
        const response = await weeklyExpanseService(user_id)
         return res.status(200).json({success:true,response:response})
      }
     }
     catch(error){
      console.log(error)
           return res.status(500).json({success:false , message:"Internal Server Error"})
     }
    }
}