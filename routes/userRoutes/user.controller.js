const sendOtpEmail = require("../../middlewares/email");
const { get_users, verify_otp, login_user,  existingUserCheck, check_TEMP_USER, generateotp, createTempUser, checkTempUser, deleteTempUser, getTempUserOTP, getSavedUser, getTempUser, usernameCheck, emailCheck, hashPass, generateOTP, hashOTP, insertTempUser, hashPassword, rateLimiter, createUser, getusers, generateToken } = require("./user.service")
const {pool} = require('../../db');
const {z, success} = require('zod');
const { validationSchema } = require("./Validators/Signup.schema");
const {OTPValSchema} = require("./Validators/OTPvalidation.schema");
const bcrypt = require ('bcrypt')
module.exports={
    getUser:(req,res)=>{
        const data = req.body
        
       get_users(data,(err,result)=>{
        if(err) return res.json({msg:"Unable to add user" ,err:err});

        res.json({msg:'Success',data:result})
       })
    },

    verifyOTP:(req,res)=>{
         const data=req.body
         console.log(data)
       verify_otp(data,(err,response)=>{
        if(err) return res.json({msg:'unable to verify the OTP', err:err,response_status:0})
        if(response !=='OTP Verified') return res.status(401).json({msg:'Invalid OTP' ,response_status:0})
        return res.json({mag:"OTP verified, Account creates successfully",response:response,response_status:1})
       })    
    },
   loginUser: async (req, res) => {
  try {
    const data = req.body
    const response = await login_user(data)

    if (!response) {
      return res.status(401).json({ msg: "Invalid email or password" })
    }

    return res.status(200).json({ msg: "Success", response:response, id:response.id })
  } catch (error) {
    return res.status(500).json({ msg: "error", err: error })
  }
},





//New Controlers




signupUser_controller: async(req,res)=>{

const result = validationSchema.safeParse(req.body)
if(!result.success){
  return res.status(400).json({success:false , error:result.error.issues[0].message})
}

const {username,email,password} = result.data

/// till here we have perfectly validated username, email,password 


let conn 
 try{

  conn = await pool.getConnection()
   await conn.beginTransaction()
  

  const userExists = await usernameCheck(conn, username)
   
  if(userExists.length>0){
    await conn.rollback()
    return res.status(409).json({success:false , message:'Username already exists! please try again with a new one'})
  }
  
  const emailExist = await emailCheck(conn,email)
  if(emailExist.length>0){
    await conn.rollback()
    return res.status(409).json({success:false, message:'Email already exists! please try again with a new email'})
  }
 

  // till here we have validated email, username, password , and we have checked if username or email exists in tbl_users

  const existingTempUser = await checkTempUser(conn, email)
    if(existingTempUser.length>0){
       await deleteTempUser(conn, email)
    }

    const hashedPassword = await hashPass(password)
    console.log('password hash hogya ')
    const otp = await generateOTP()
    console.log('Ye rha OTP:' , otp)
    const hashedOTP = await hashOTP(String(otp))

    await insertTempUser(conn,username,email,hashedPassword,hashedOTP)
    //here will be the middleware function that sends otp to the email of user using node mailer , I have made it but nor using ir for now , for testing purpose only
    await conn.commit()
    return res.status(200).json({success:true, message:'OTP sent Successfully'})
 }
 catch(error){
  if(conn) await conn.rollback()
    console.log('error:', error)
    return res.status(500).json({success:false, message:'Internal Server error '})
 }
 finally{
  if(conn) conn.release()
 }
},

OTPvarify : async(req,res)=>{

  const response = OTPValSchema.safeParse(req.body)
  
  if(!response.success){
    return res.status(400).json({success:false , message:response.error.issues[0].message})
  }

  const {otp,email} = response.data
  // till here we have a correct otp and a correct email 

  let conn
  try{
    conn = await pool.getConnection()
    await conn.beginTransaction()
      
    const existingUser = await getSavedUser(email,conn)
    const tempUserData  = await getTempUser(email,conn)

  
    if(tempUserData.length===0){
      if(existingUser.length>0){
        await conn.rollback()
        return res.status(200).json({success:true, message:"OTP already verified"})
      }
      else{
        await conn.rollback()
        return res.status(400).json({success:false , message:"Invalid request!"})
      }
    }

    //till here we have an email and a otp that is not varified ! 
    const curtime = Date.now()
    const createdAt = tempUserData[0].created_at.getTime()
    const timeDiff = (curtime-createdAt) / 60000
    if(timeDiff>5){
    
    await  deleteTempUser(conn,email)
 
    await conn.commit()
    return res.status(403).json({success:false , message:"OTP Expired! please request a new one"})
    }

  
    // till here we haeve a email and a otp that is not varified and expired 

     const isValid =await bcrypt.compare(otp,tempUserData[0].otp)

     if(!isValid){
      await conn.rollback()
      return res.status(403).json({success:false , message:"Invalid OTP! Try again"})
     }
     await createUser(conn,tempUserData[0].username,tempUserData[0].email,tempUserData[0].password)
     await deleteTempUser(conn,email)
     await conn.commit()
     return res.status(200).json({success:true , message:"OTP verified successfully"})


    
  }
  catch(error){
    if(conn) await conn.rollback()
      console.log('error ye rha : ======', error)
     return res.status(500).json({success:false , message:"Internal server error"})
  }
  finally{
   if(conn) conn.release()
  }
},




loginController : async(req,res)=>{
   

  const {username,email,password} = req.body
       if(!username && !email ){
        return res.status(403).json({success:false , message:'invalid credentials'})
       }
       if(!password){
        return res.status(403).json({success:false , message:'invalid credentials'})
       }
  let conn
  try{
       conn = await pool.getConnection()
     

       const userData = await getusers(conn,username,email)

       if(userData.length===0){
   
        return res.status(403).json({success:false , message:'invalid credentials'})
       }

       const isvalid =await bcrypt.compare(password,userData[0].password)

       if(!isvalid){
      
               return res.status(403).json({success:false , message:'invalid credentials'})

       }

      let token = await generateToken(userData[0])

      return res.status(200).json({success:true , message:'Login Successful' , token:token})



  }
  catch(error){
 
      console.log(error)
      return res.status(500).json({success:false , message:'internal server error'})
  }
  finally{
  if(conn) conn.release()  
}

  


}



}