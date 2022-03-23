const express = require("express");
const {route}=require("./ticket.router");
const router = express.Router();

const{insertTech,getTechByEmail,getTechById,getTech}=require("../model/tech/Tech.model");
const{hashPassword,comparePassword}=require("../helpers/bcrypt.helper");
const{crateAccessJWT,crateTechRefreshJWT}=require("../helpers/jwt.helpers");
const {techAuthorization,teamAuthorization}=require("../middlewares/autherization.middleware");
const { setPasswordRestPin, deletePin, getPinByEmailPin } = require("../model/restPin/RestPin.model");
const { emailProcessor } = require("../helpers/email.helper");
const { resetPassReqValidation, updatePassValidation } = require("../middlewares/formValidation.middleware");
const { updatePassword ,storeTechRefreshJWT} = require("../model/tech/Tech.model");
const { deleteJWT } = require("../helpers/redis.helpers");


//get Tech profile router
router.get("/",techAuthorization,async(req,res)=>{
	///this data came from database

	const _id=req.userId
	
	const TechProf=await getTechById(_id)
	const {name,email}=TechProf;
	//3extract Tech id
    //4get Tech profile based on the Tech id
		res.json({Tech:{
		_id,
		name,
		email,
		}
		
		})
})

//get tech profile for team
router.get("/team",teamAuthorization,async(req,res)=>{
	///this data came from database

	// const _id=req.TechId
	try {
		const result=await getTech()
		return res.json({
			status: "success",
			result,

		})

		
	} catch (error) {
		res.json({ status: "error", message: error.message });
		
	}
	
})




//create new Tech route
router.all("/",(req,res,next) => {

    
   // res.json({message:"return from Tech"});
   next();
});

router.post("/",async(req,res)=>{
    const{name,company,address,phone,email,password}=req.body;


    try{
        //hashpassword
        const hashedPass=await hashPassword(password);

        const newTechObj={
            name,
            company,
            address,
            phone,
            email,
            password:hashedPass,
        };

        const result=await insertTech(newTechObj);
        console.log(result);

        res.json({message:"New Tech created ",result});
    }catch (error){
        console.log(error);
        res.json({status:"error",message: error.message});
    }
});

//Tech sign in Router
router.post("/login", async (req, res) => {
	console.log(req.body);
	const { email, password } = req.body;

	if (!email || !password) {
		return res.json({ status: "error", message: "Invalid form submition!" });
	}

	const Tech = await getTechByEmail(email);
	console.log(Tech);
	

	// if (!Tech.isVerified) {
	// 	return res.json({
	// 		status: "error",
	// 		message:
	// 			"You account has not been verified. Please check your email and verify you account before able to login!",
	// 	});
	// }

	const passFromDb = Tech && Tech._id ? Tech.password : null;

	if (!passFromDb)
		return res.json({ status: "error", message: "Invalid email or password!" });

	const result = await comparePassword(password, passFromDb);
	console.log(result);

	if (!result) {
		return res.json({ status: "error", message: "Invalid email or password!" });
	}

	const accessJWT = await crateAccessJWT(Tech.email,`${Tech._id}`);
	const refreshJWT = await crateTechRefreshJWT(Tech.email,`${Tech._id}`);

	res.json({
		status: "success",
		message: "Login Successfully!",
		accessJWT,
		refreshJWT,
	});
});
//Tech reset password
router.post("/reset-password", resetPassReqValidation, async (req, res) => {
	const { email } = req.body;

	const Tech = await getTechByEmail(email);

	if (Tech && Tech._id) {
		/// crate// 2. create unique 6 digit pin
		const setPin = await setPasswordRestPin(email);
		await emailProcessor({
			email,
			pin: setPin.pin,
			type: "request-new-password",
		});
	}

	res.json({
		status: "success",
		message:
			"If the email is exist in our database, the password reset pin will be sent shortly.",
	});
});

//Tech password update
router.patch("/reset-password", updatePassValidation, async (req, res) => {
	const { email, pin, newPassword } = req.body;

	const getPin = await getPinByEmailPin(email, pin);
	// 2. validate pin
	if (getPin?._id) {
		const dbDate = getPin.addedAt;
		const expiresIn = 1;

		let expDate = dbDate.setDate(dbDate.getDate() + expiresIn);

		const today = new Date();

		if (today > expDate) {
			return res.json({ status: "error", message: "Invalid or expired pin." });
		}

		// encrypt new password
		const hashedPass = await hashPassword(newPassword);

		const Tech = await updatePassword(email, hashedPass);

		if (Tech._id) {
			// send email notification
			await emailProcessor({ email, type: "update-password-success" });

			////delete pin from db
			deletePin(email, pin);

			return res.json({
				status: "success",
				message: "Your password has been updated",
			});
		}
	}
	res.json({
		status: "error",
		message: "Unable to update your password. plz try again later",
	});
});

// Tech logout and invalidate jwts

router.delete("/logout", techAuthorization, async (req, res) => {
	const { authorization } = req.headers;
	//this data coming form database
	const _id = req.userId;

	// 2. delete accessJWT from redis database
	deleteJWT(authorization);

	// 3. delete refreshJWT from mongodb
	const result = await storeTechRefreshJWT(_id, "");

	if (result._id) {
		return res.json({ status: "success", message: "Loged out successfully" });
	}

	res.json({
		status: "error",
		message: "Unable to logg you out, plz try again later",
	});
});

module.exports=router;