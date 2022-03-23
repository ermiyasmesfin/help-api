const {verifyAccessJWT,verifyTechAccessJWT,verifyTeamAccessJWT}=require("../helpers/jwt.helpers");
const{getJWT, deleteJWT}=require("../helpers/redis.helpers");


const userAuthorization=async (req,res,next)=>{
    const{ authorization}=req.headers;
    
    //1 verify if jwt is valid
    const decoded=await verifyAccessJWT(authorization);
    console.log(decoded);
    if(decoded.email){
        const userId=await getJWT(authorization)
        console.log(userId)

        if(!userId){
           return res.status(403).json({message:"Forbidden"})
        }

        req.userId=userId
        return next();
    }
    deleteJWT(authorization)
    return res.status(403).json({message:"Forbidden"})
    //2 check if jwt is exist in redis
    //3extract user id
    //4get user profile based on the user id
   
}
const techAuthorization=async (req,res,next)=>{
    const{ authorization}=req.headers;
    
    //1 verify if jwt is valid
    const decoded=await verifyTechAccessJWT(authorization);
    console.log(decoded);
    if(decoded.email){
        const userId=await getJWT(authorization)
        console.log(userId)

        if(!userId){
           return res.status(403).json({message:"Forbidden"})
        }

        req.userId=userId
        return next();
    }
    deleteJWT(authorization)
    return res.status(403).json({message:"Forbidden"})
    //2 check if jwt is exist in redis
    //3extract user id
    //4get user profile based on the user id
   
}
const teamAuthorization=async (req,res,next)=>{
    const{ authorization}=req.headers;
    
    //1 verify if jwt is valid
    const decoded=await verifyTeamAccessJWT(authorization);
    console.log(decoded);
    if(decoded.email){
        const userId=await getJWT(authorization)
        console.log(userId)

        if(!userId){
           return res.status(403).json({message:"Forbidden"})
        }

        req.userId=userId
        return next();
    }
    deleteJWT(authorization)
    return res.status(403).json({message:"Forbidden"})
    //2 check if jwt is exist in redis
    //3extract user id
    //4get user profile based on the user id
   
}
module.exports={
    userAuthorization,
    techAuthorization,
    teamAuthorization
}