const { pool } = require("../../db");
module.exports = {
  checkBudgetExists: async (user_id) => {
    const budget = await pool.query(process.env.CHECK_BUDGET, [user_id]);
    return budget;
  },

  updateBudget: async (user_id, budget, budget_type) => {
    const budget_updated = await pool.query(process.env.UPDATE_BUDGET, [
      budget,
      budget_type,
      user_id,
    ]);
    return budget_updated;
  },
  add_Budget: async (user_id, budet, budget_type) => {
    const budget_added = await pool.query(process.env.ADD_BUDGET, [
      user_id,
      budet,
      budget_type,
    ]);
    return budget_added;
  },

  get_budget: async (user_id) => {
    const [budget] = await pool.query(process.env.GET_BUDGET, [user_id]);
    return budget[0];
  },

  // dailyexpanseService:async function(user_id){
  //      const [total_expanse] = await pool.query(process.env.DAILYexpanse,[user_id])
  //      const budget = await this.get_budget(user_id)
  //      const percentage = (total_expanse.spent/budget.budget)*100
  //       const spent= total_expanse.spent || 0
  //      if(percentage>100){
  //         return ({
  //             'budget_type':'daily',
  //             'budget':budget.budget,
  //             'spent':spent,
  //             'percentage':percentage,
  //             'status':'alert'
  //         })
  //      }
  //      else if(percentage>80){
  //         return ({
  //             'budget_type':'daily',
  //             'budget':budget.budget,
  //             'spent':spent,
  //             'percentage':percentage,
  //             'status':'warning'
  //         })
  //      }
  //      else{
  //         return ({
  //             'budget_type':'daily',
  //             'budget':budget.budget,
  //             'spent':spent,
  //             'percentage':percentage,
  //             'status':'ok'
  //         })
  //      }
  // },
  // weeklyexpanseService:async function(user_id)

  // {
  //              const [total_expanse] = await pool.query(process.env.WEEKLYexpanse,[user_id])
  //      const budget = await this.get_budget(user_id)
  //      const percentage = (total_expanse.spent/budget.budget)*100
  //     const spent= total_expanse.spent || 0
  //      if(percentage>100){
  //         return ({
  //             'budget_type':'weekly',
  //             'budget':budget.budget,
  //             'spent':spent,
  //             'percentage':percentage,
  //             'status':'alert'
  //         })
  //      }
  //      else if(percentage>80){
  //         return ({
  //             'budget_type':'weekly',
  //             'budget':budget.budget,
  //             'spent':spent,
  //             'percentage':percentage,
  //             'status':'warning'
  //         })
  //      }
  //      else{
  //         return ({
  //             'budget_type':'weekly',
  //             'budget':budget.budget,
  //             'spent':spent,
  //             'percentage':percentage,
  //             'status':'ok'
  //         })
  //      }
  // },

  dailyexpanseService: async (user_id) => {
    const [budgetRows] = await pool.query(process.env.GET_BUDGET_FOR_EXPANSES, [
      user_id,
    ]);
    console.log('budgetRows',budgetRows)
    const budget = budgetRows[0]?.budget ||0;
    console.log("budget :",budget)
    const [dailyexpanse] = await pool.query(process.env.DAILYEXPANSE, [
      user_id,
    ]);
    console.log('dailyexpanse',dailyexpanse)
    const expanse = dailyexpanse[0]?.spent || 0;
    console.log("expanse",expanse)
    const percentage = budget ? parseFloat(((expanse / budget) * 100).toFixed(2)) : 0;

    if (percentage > 100) {
      return {
        budget_type: "daily",
        budget: budget,
        spent: expanse,
        percentage: percentage,
        status: "alert",
      };
    }
   else if(percentage>80){
     return {
        budget_type: "daily",
        budget: budget,
        spent: expanse,
        percentage: percentage,
        status: "warning",
      };
      
   }
   else{
     return {
        budget_type: "daily",
        budget: budget,
        spent: expanse,
        percentage: percentage,
        status: "ok",
      };
   }
  },

    weeklyExpanseService: async (user_id) => {
    const [budgetRows] = await pool.query(process.env.GET_BUDGET_FOR_EXPANSES, [
      user_id,
    ]);
    const budget = budgetRows[0]?.budget || 0;
    const [dailyexpanse] = await pool.query(process.env.WEEKLYEXPANSE, [
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
        status: "alert",
      };
    }
   else if(percentage>80){
     return {
        budget_type: "weekly",
        budget: budget,
        spent: expanse,
        percentage: percentage,
        status: "warning",
      };
      
   }
   else{
     return {
        budget_type: "weekly",
        budget: budget,
        spent: expanse,
        percentage: percentage,
        status: "ok",
      };
   }
  },
};
