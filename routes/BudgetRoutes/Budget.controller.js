const { response } = require("../../app")
const { checkBudgetExists, updateBudget, add_Budget, get_budget, dailyexpanseService, weeklyexpanseService } = require("./budget.service")

module.exports={
    addBudget:async(req,res)=>{
        const {user_id,budget,budget_type}= req.body

        
          try{
               if(!budget){ return res.status(400).json({msg:'missing Budget'})}
             if(!budget_type){ return res.status(400).json({msg:'missing Budget type'})}
              if(!user_id){ return res.status(400).json({msg:'missing user id '})}
            
             const budgetExixts = await checkBudgetExists(user_id)
           if(budgetExixts[0].length===0){
            const addedBudget = await add_Budget(user_id,budget,budget_type)
                return res.status(200).json({msg:"New Budget Created" , response:addedBudget })
           }
           else{
            const UpdatedBudget = await  updateBudget(user_id,budget,budget_type)
            console.log(user_id,budget,budget_type)
            return res.status(200).json({msg:"Budget Updated Successfuly",response:UpdatedBudget})
           }
             
          }
          catch(error){
             return res.status(500).json({msg:"Error", error:error})
          }
    },

    getBudget:async(req,res)=>{
       const {user_id} = req.query
          try{
              const userBudget = await get_budget(user_id)
              if(userBudget.length===0){
                return res.status(204).json({msg:"Budget Not Found"})
              }
              else{
                       return res.status(200).json({msg:"Success", response:userBudget })
              }
          }
          catch(error){
            return res.status(500).json({msg:"Server Error", Error:error})
          }

    },


    budgetAlertController: async(req,res)=>{
      const {user_id,budget_type }=req.params
     
     console.log(user_id,budget_type)
     try{
      if(!user_id) return res.status(400).json({msg:'Missing user_id'})
      if(!budget_type) return res.status(400).json({msg:'Missing budget_type'})
      
      if(budget_type==='daily'){
        const response = await dailyexpanseService(user_id)
         return res.status(200).json({msg:'success',response:response})
      }
       if(budget_type==='weekly'){
        const response = await weeklyexpanseService(user_id)
         return res.status(200).json({msg:'Success',response:response})
      }
     }
     catch(error){
           return res.status(500).json({msg:'error from server' , error:error})
     }
    }
}