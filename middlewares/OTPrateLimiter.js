
const reqMap = new Map()
module.exports={
rate_Limiter: (req,res,next)=>{
        const {email} = req.body
         if(!email){
            return res.status(400).json({status:false ,  message:"Invalid Request"})
        }
        const maxAttempts = 5
        const window  = 5 * 60000
        const curTime = Date.now()
        // check krna hai  === agr current time - saved time agr kam hai window se 
        const recentReqTime = (reqMap.get(email)||[]).filter((e)=>curTime-e < window)

        if(recentReqTime.length>=maxAttempts){
            return res.status(429).json({success:false , message:'Too many attempts! try again after 5 minutes'})
        }

        recentReqTime.push(curTime)
        reqMap.set(email , recentReqTime)
        next()
    }
}