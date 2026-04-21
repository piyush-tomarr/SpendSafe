const express = require('express')

const authMiddleware = require('../../Auth/Auth')
const { rate_Limiter } = require('../../middlewares/OTPrateLimiter')
const { loginUser, signupUser_controller, OTPvarify, loginController, resendOtp } = require('./user.controller')
const router = express.Router()



router.post('/login',loginUser )

router.get('/me',authMiddleware,(req,res)=>{
    return res.status(200).json({message:"Authenticated ",user:req.user})
})



//new Routes
router.post('/signin-users' , signupUser_controller)

router.post('/otp-varify',rate_Limiter, OTPvarify )
router.post('/log-in' , loginController )
router.post('/resend-otp',resendOtp)



module.exports = router