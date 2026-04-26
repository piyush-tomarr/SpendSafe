const {pool} = require('../../db')
const sendOtpEmail = require('../../middlewares/email')
require('dotenv').config();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
module.exports = {



 //new Signup User

 usernameCheck: async(conn,username)=>{
      
    let [userCheck] = await conn.query('SELECT username FROM tbl_users WHERE username=? LIMIT 1',[username])
    return userCheck
 },




 emailCheck: async(conn,email)=>{
    let [emailCheck] = await conn.query('SELECT email FROM tbl_users WHERE email=? LIMIT 1',[email])
    return emailCheck
 },

 hashPass: async(password)=>{

    const saltrounds  = 10
   
    const hashedPassword = await bcrypt.hash(password,saltrounds||10)
    return hashedPassword
 },


 generateOTP : async()=>{
    const otp = Math.floor(1000+Math.random()*9000)
    return otp
 },

 
 hashOTP: async(otp)=>{
   const saltrounds = 10
   const hashedOTP = await bcrypt.hash(otp,saltrounds|| 10)
   return hashedOTP
 },
 checkTempUser: async(conn,email)=>{
    const [tempuser] = await conn.query('SELECT 1 AS existStatus FROM temp_users WHERE email = ?',[email])
    return tempuser
 },
 deleteTempUser: async(conn,email)=>{
    await conn.query('DELETE FROM temp_users WHERE email=?',[email])
    
},

insertTempUser: async(conn,username,email,password,otp)=>{
    await conn.query('INSERT INTO temp_users (username,email,PASSWORD,otp) VALUES(?,?,?,?)' , [username,email,password,otp])
},


 //varify otp

 getTempUser: async(email,conn)=>{
    const VARIFY_OTP='SELECT * FROM temp_users WHERE email=? FOR UPDATE'
    let  [response] = await conn.query(VARIFY_OTP,[email])
    return response
 },


 createUser: async(conn,username,email,password)=>{
     const INSERT_USERS='INSERT INTO tbl_users (username,email,PASSWORD) VALUES(?,?,?)'
     await conn.query(INSERT_USERS,[username,email,password])
 },
 getSavedUser: async(email,conn)=>{
    const GET_USER='SELECT email FROM tbl_users WHERE email=? '
     let [user] = await conn.query(GET_USER,[email])
     return user
 },



 //login

 getusers:async(conn,username,email)=>{
    let query ='SELECT* FROM tbl_users WHERE username=? OR email = ?'
    const [rows] = await conn.query(query,[username,email])
    return rows
 },

 generateToken : async(data)=>{

    let payload = {
        username:data.username,
        email:data.email
    }

    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {expiresIn:'7d'}
     )

     return token
 }
 

  
}