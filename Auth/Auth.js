

const jwt = require('jsonwebtoken')

const authMiddleware = (req,res,next)=>{
    try{
                  const authToken  = req.headers.authorization

    if(!authToken || !authToken.startsWith('Bearer ')){
        return res.status(401).json({msg:"Unauthorised"})
    }

    // abhi hmare pass aa rha hai kuch esa "Bearer <Token>" ab isko convert krna h 

    const token  = authToken.split(" ")[1]
    const decoded = jwt.verify(token,process.env.JWT_SECRET)
    console.log("DECODED TOKEN:", decoded)
    req.user=decoded
    next()
    }
    catch(error){
         return res.status(401).json({msg:"Expired or Missing Token"})
    }
}

module.exports = authMiddleware