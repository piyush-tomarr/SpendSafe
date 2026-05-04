const { pool } = require("../../db");
module.exports = {
 
   getUserWallet : async(user_id)=>{
     let query ="SELECT * FROM tbl_wallet WHERE user_id=?"
     let [userWallet] = await pool.query(query,[user_id])
     return userWallet
   },

  checkBudgetExists: async (user_id) => {
    let query="SELECT id FROM tbl_budget WHERE user_id=? LIMIT 1"
    const [budget] = await pool.query(query ,[user_id]);
    return budget;
  },

  updateBudget: async (user_id, budget, budget_type) => {
    let query='UPDATE tbl_budget SET budget=? , budget_type=? WHERE user_id=?'
    const budget_updated = await pool.query(query, [
      budget,
      budget_type,
      user_id,
    ]);
   
  },

  add_Budget: async (user_id, budet, budget_type) => {
    let query='INSERT INTO tbl_budget (user_id,budget,budget_type) VALUES(?,?,?)'
    const budget_added = await pool.query(query, [
      user_id,
      budet,
      budget_type,
    ]);

  },

  get_budget: async (user_id) => {
    let query='SELECT * FROM tbl_budget WHERE user_id = ?'
    const [budget] = await pool.query(query, [user_id]);
    return budget;
  },


  dailyexpanseService: async (user_id) => {
     let getBudgetQuery = 'SELECT budget FROM tbl_budget WHERE user_id=?'
    const [budgetRows] = await pool.query(getBudgetQuery, [
      user_id,
    ]);
  
    const budget = budgetRows[0]?.budget ||0;

    let dailyExpanceQuery= "SELECT SUM(amount) AS spent FROM tbl_transactions WHERE user_id=? AND transaction_type='debit' AND STATUS='success' AND DATE(created_at)=CURDATE();"
    const [dailyexpanse] = await pool.query(dailyExpanceQuery, [
      user_id,
    ]);
 
    const expanse = dailyexpanse[0]?.spent || 0;
    
    const percentage = budget ? parseFloat(((expanse / budget) * 100).toFixed(2)) : 0;

    if (percentage > 100) {
      return {
        budget_type: "daily",
        budget: budget,
        spent: expanse,
        percentage: percentage,
        status: "Alert",
        message:"You have exceeded your Daily budget limit"
      };
    }
   else if(percentage>80){
     return {
        budget_type: "daily",
        budget: budget,
        spent: expanse,
        percentage: percentage,
        status: "Warning",
        message:"You are about to reach your Daily Budget limit"
      };
      
   }
   else{
     return {
        budget_type: "daily",
        budget: budget,
        spent: expanse,
        percentage: percentage,
        status: "Relax",
         message:'You are under your Daily Limit'
      };
   }
  },

    weeklyExpanseService: async (user_id) => {
      let getBudgetQuery ='SELECT budget FROM tbl_budget WHERE user_id=?'
    const [budgetRows] = await pool.query(getBudgetQuery, [
      user_id,
    ]);
    const budget = budgetRows[0]?.budget || 0;
    let weeklyExpanceQuery= "SELECT SUM(amount) AS spent FROM tbl_transactions WHERE user_id=? AND transaction_type='debit' AND STATUS='success'  AND YEARWEEK(created_at,1) = YEARWEEK(CURDATE(),1);"
    const [dailyexpanse] = await pool.query(weeklyExpanceQuery, [
      user_id,
    ]);
    const expanse = dailyexpanse[0]?.spent || 0;
   const percentage = budget ? parseFloat(((expanse / budget) * 100).toFixed(2)) : 0;

    if (percentage > 100) {
      return {
        budget_type: "weekly",
        budget: budget,
        spent: expanse,
        percentage: percentage,
        status: "Alert",
        message:"You have exceeded your Weekly budget limit"
      };
    }
   else if(percentage>80){
     return {
        budget_type: "weekly",
        budget: budget,
        spent: expanse,
        percentage: percentage,
        status: "Warning",
        message:"You are about to reach your Weekly Budget limit"
      };
      
   }
   else{
     return {
        budget_type: "weekly",
        budget: budget,
        spent: expanse,
        percentage: percentage,
        status: "Relax",
        message:'You are under your Weekly Limit'
      };
   }
  },
};
