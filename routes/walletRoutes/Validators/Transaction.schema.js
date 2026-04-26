const {z} =  require('zod')


const CreditSchema = z.object({
    amount:z.number({required_error:"Amount can not be empty" , invalid_type_error:"amount must be a number"}).int().positive('amount must be greater than 0'),
    transaction_type:z.literal('credit'),
    request_id:z.string({required_error:"request id is required" ,  invalid_type_error:"request id must be string"}).uuid('request_id must be a valid UUID'),
    note: z.string({invalid_type_error:'please add a clear note'}).trim().min(3 , 'note must be meaningful').max(255,'Your note exceeds the  word limit').optional()
})

const DebitSchema= z.object({
     amount:z.number({required_error:"Amount can not be empty" , invalid_type_error:"amount must be a number"}).int().positive('amount must be greater than 0') ,
     transaction_type:z.literal('debit'),
     request_id:z.string({required_error:"request id is required" ,  invalid_type_error:"request id must be string"}).uuid('request_id must be a valid UUID'),
     category:z.enum(['important' , 'non-negotiable','misc'] , {invalid_type_error:"selece a category out of 'important' , 'non-negotiable','misc' " , required_error:'Category is required'}),
      note: z.string({invalid_type_error:'please add a clear note'}).trim().min(3 , 'note must be meaningful').max(255,'Your note exceeds the  word limit').optional()
    })

    module.exports={
         transactionSchema  : z.discriminatedUnion('transaction_type',[CreditSchema , DebitSchema])
    }