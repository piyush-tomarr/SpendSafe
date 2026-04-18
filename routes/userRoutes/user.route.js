const express = require('express')
const { getUser, verifyOTP, loginUser, SignupControler, OTP_varification_controler, otp_varify, signup_Controller, signupUser_controller, OTPvarify, loginControler, loginController } = require('./user.controller')
const authMiddleware = require('../../Auth/Auth')
const router = express.Router()

router.post('/getUsers',getUser)  // brngs user details from signup page

router.post('/verifyotp',verifyOTP) // helps to verify the otp and create the account 

router.post('/login',loginUser )

router.get('/me',authMiddleware,(req,res)=>{
    return res.status(200).json({message:"Authenticated ",user:req.user})
})



//new Routes
router.post('/signin-users' , signupUser_controller)

router.post('/otp-varify' , OTPvarify )
router.post('/log-in' , loginController )




module.exports = router