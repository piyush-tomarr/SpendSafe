let {z} = require('zod')


module.exports = {
    addBudgetSchema : z.object({
        user_id:z.number({required_error:"User_id is required" , invalid_type_error:"Please enter a valid user_id"}).int({message:"Invalid input type"}).positive({message:"user id can't be negative"}),
        budget_type:z.enum(["daily","weekly"],{message:'please chose a valid Budget type "daily" , "weekly"'}),
        budget:z.number({required_error:"Budget is required" , invalid_type_error:"Please enter a valid budget"}).int({message:'invalid input type'}).positive({message:"Budget can not be negative"})
    })
}