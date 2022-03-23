const express = require("express");

const router = express.Router();
const {verifyRefreshJWT, crateAccessJWT}= require("../helpers/jwt.helpers");
const { getUserByEmail } = require("../model/user/User.model");
const {getTechByEmail}= require("../model/tech/Tech.model")
const {getTeamByEmail}=require ("../model/team/Team.model")

//return refresh jwt
router.get("/",async(req,res,next) => {

    const {authorization}  = req.headers;

        //token valid
        const decoded = await verifyRefreshJWT(authorization);
       
        if (decoded.email){
            //check if the jwt is in database

            const userProf = await getUserByEmail(decoded.email);
            

         if(userProf._id){
             let tokenExp = userProf.refreshJWT.addedAt;
             const dBrefreshToken=userProf.refreshJWT.token;

             tokenExp = tokenExp.setDate(
                 tokenExp.getDate() + +process.env.JWT_REFRESH_SECRET_EXP_DAY
             );

             const today=new Date();
             
             if(dBrefreshToken!==authorization&& tokenExp <today){
               return res.status(403).json({message: "Forbidden"});
             }
             const accessJWT=await crateAccessJWT(decoded.email,userProf._id.toString());
             return res.json({status:"success",accessJWT})
            
             }

        }
                    res.status(403).json({message:"Forbidden"});
});

router.get("/tech",async(req,res,next) => {

    const {authorization}  = req.headers;

        //token valid
        const decoded = await verifyRefreshJWT(authorization);
       
        if (decoded.email){
            //check if the jwt is in database

            const techProf = await getTechByEmail(decoded.email);
            

         if(techProf._id){
             let tokenExp = techProf.refreshJWT.addedAt;
             const dBrefreshToken=techProf.refreshJWT.token;

             tokenExp = tokenExp.setDate(
                 tokenExp.getDate() + +process.env.JWT_REFRESH_SECRET_EXP_DAY
             );

             const today=new Date();
             
             if(dBrefreshToken!==authorization&& tokenExp <today){
               return res.status(403).json({message: "Forbidden"});
             }
             const accessJWT=await crateAccessJWT(decoded.email,techProf._id.toString());
             return res.json({status:"success",accessJWT})
            
             }

        }
                    res.status(403).json({message:"Forbidden"});
});
router.get("/team",async(req,res,next) => {

    const {authorization}  = req.headers;

        //token valid
        const decoded = await verifyRefreshJWT(authorization);
       
        if (decoded.email){
            //check if the jwt is in database

            const techProf = await getTeamByEmail(decoded.email);
            

         if(techProf._id){
             let tokenExp = techProf.refreshJWT.addedAt;
             const dBrefreshToken=techProf.refreshJWT.token;

             tokenExp = tokenExp.setDate(
                 tokenExp.getDate() + +process.env.JWT_REFRESH_SECRET_EXP_DAY
             );

             const today=new Date();
             
             if(dBrefreshToken!==authorization&& tokenExp <today){
               return res.status(403).json({message: "Forbidden"});
             }
             const accessJWT=await crateAccessJWT(decoded.email,techProf._id.toString());
             return res.json({status:"success",accessJWT})
            
             }

        }
                    res.status(403).json({message:"Forbidden"});
});
module.exports=router;