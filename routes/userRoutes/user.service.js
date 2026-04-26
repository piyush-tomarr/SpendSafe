const {pool} = require('../../db')
const sendOtpEmail = require('../../middlewares/email')
require('dotenv').config();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
module.exports = {
   
           get_users:async (data,callback)=>{
              

            //is section me wo sb queries h jo hum aage is code me use krne wale h 
               const email_ckeck = process.env.EMAIL_CHECK
               const username_check  = process.env.username_check
               const saltrounds = parseInt(process.env.salt_rounds||10) 
               const temp_users = process.env.TEMP_USERS
               const delete_duplicate_otp = process.env.DELETE_OLD_OTP


               let connection;  //connrction yahan delare kr ke try block ke initialise krenge taki leak hone ke chances na ho 

               //try block starts 
               try{
                 connection =await pool.getConnection() //yahan humne upr declare ki hui connection ko initialise kia h
                 await connection.beginTransaction()
                 const [emailRows] =await connection.query(email_ckeck,[data.email])
                 if(emailRows.length>0){
                  await connection.rollback()
                  return callback('Email already exists')
                 }
                 const [usernameRows] = await connection.query(username_check,[data.username])
                 if(usernameRows.length>0){
                  await connection.rollback()
                  return callback('Username already exists')
                 }
                 const hashedpassword = await bcrypt.hash(data.password,saltrounds)
                 const otp  =  Math.floor(1000+Math.random()*8000)

                   await connection.query(delete_duplicate_otp,[data.email])
                   await connection.query(temp_users,[data.username,data.email,hashedpassword,otp])
                   await connection.commit()
                  
                   return callback(null,"OTP sent successfully")
                   
               }
               catch{
                    
                  if (connection)  await  connection.rollback()
                     
                    return callback ('Error sending otp')
               } 
               finally{
                if (connection)connection.release()
               }
           },

  
    verify_otp: async(data,callback)=>{
          const get_otp = process.env.GET_OTP;
          const user_details = process.env.USER_DETAILS
          const insert_users = process.env.INSERT_USERS
          try{
              const [rows] = await pool.query(get_otp,[data.email])
              console.log(rows,data.email)
              if (rows.length === 0) return callback(null,"OTP Expired");
              const db_otp = rows[0]
              if(db_otp.otp!=data.otp) return callback(null,"Invalid OTP");
              const [userDetails] = await pool.query(user_details,[data.email])
              console.log(userDetails)
              const username = userDetails[0].username
              const email = userDetails[0].email
              const pass = userDetails[0].PASSWORD
            //   console.log(username,email,pass)
              await pool.query(insert_users,[username,email,pass])
              return callback(null,"OTP Verified")
              

             
          }
          catch(error){
              return callback(error)
          }
    },

    login_user:async (data)=>{
        //  console.log(data)
        try{
        const [rows] =await  pool.query(process.env.LOGIN_DETAILS,[data.uid,data.uid])
        
         if (!rows.length) return null
       const user=rows[0]
       
         const varifypassword = await bcrypt.compare(String(data.password), user.password)
          if(!varifypassword) return null
        
            const token = jwt.sign(
                {
                    id:user.id,
                    email:user.email
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "7d"
                }
            )

            return{
                id:user.id,
                token
            }
         }
        
        
        
        catch(err){
             throw (err)
        }
    
    } ,



    //Signup User 
existingUserCheck:async(conn,username,email)=>{
    const [usernameCheck] = await conn.query(process.env.CHECK_USERNAME,[username])
    const[emailCheck] = await conn.query(process.env.CHECK_EMAIL,[email])

    if(usernameCheck.length>0){
        return ({status:'usernameExists'})
    }
    else if(emailCheck.length>0){
        return({status:'emailExists'})
    }
    else{
        return({status:'ok'})
    }


},
// checkTempUser:async(conn,email)=>{
//     const [check_user] = await conn.query(process.env.CHECK_TEMP_USER,[email])
   
//        if(check_user.length>0){
//         return({status:true})
//        }
//        else{
//         return ({status:false})
//        }

// },


hashPassword: async(password)=>{
    const saltrounds = parseInt(process.env.SALTROUNDS)||10
    const hashedPassword = await bcrypt.hash(password,saltrounds)
    return hashedPassword
 },

generateotp :async()=>{
     const otp  = String( Math.floor(1000+Math.random()*8000))
     return otp;
},

 createTempUser :async(conn,username,email,password,otp)=>{
      await conn.query(process.env.INSERT_TEMPUSER,[username,email,password,otp])
 },





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