const express = require("express");
const {route}=require("./ticket.router");
const router = express.Router();

const{insertTeam,getTeamByEmail,getTeamById}=require("../model/team/Team.model");
const{hashPassword,comparePassword}=require("../helpers/bcrypt.helper");
const{crateAccessJWT,crateTeamRefreshJWT}=require("../helpers/jwt.helpers");
const {teamAuthorization}=require("../middlewares/autherization.middleware");
const { setPasswordRestPin, deletePin, getPinByEmailPin } = require("../model/restPin/RestPin.model");
const { emailProcessor } = require("../helpers/email.helper");
const { resetPassReqValidation, updatePassValidation } = require("../middlewares/formValidation.middleware");
const { updatePassword ,storeTeamRefreshJWT} = require("../model/team/Team.model");
const { deleteJWT } = require("../helpers/redis.helpers");


//get Team profile router
router.get("/",teamAuthorization,async(req,res)=>{
	///this data came from database

	const _id=req.userId
	
	const TeamProf=await getTeamById(_id)
	const {name,email}=TeamProf;
	//3extract Team id
    //4get Team profile based on the Team id
		res.json({Team:{
		_id,
		name,
		email,
		}
		
		})
})




//create new Team route
router.all("/",(req,res,next) => {

    
   // res.json({message:"return from Team"});
   next();
});

router.post("/",async(req,res)=>{
    const{name,company,address,phone,email,password}=req.body;


    try{
        //hashpassword
        const hashedPass=await hashPassword(password);

        const newTeamObj={
            name,
            company,
            address,
            phone,
            email,
            password:hashedPass,
        };

        const result=await insertTeam(newTeamObj);
        console.log(result);

        res.json({message:"New Team created ",result});
    }catch (error){
        console.log(error);
        res.json({status:"error",message: error.message});
    }
});

//Team sign in Router
router.post("/login", async (req, res) => {
	console.log(req.body);
	const { email, password } = req.body;

	if (!email || !password) {
		return res.json({ status: "error", message: "Invalid form submition!" });
	}

	const Team = await getTeamByEmail(email);
	console.log(Team);
	

	// if (!Team.isVerified) {
	// 	return res.json({
	// 		status: "error",
	// 		message:
	// 			"You account has not been verified. Please check your email and verify you account before able to login!",
	// 	});
	// }

	const passFromDb = Team && Team._id ? Team.password : null;

	if (!passFromDb)
		return res.json({ status: "error", message: "Invalid email or password!" });

	const result = await comparePassword(password, passFromDb);
	console.log(result);

	if (!result) {
		return res.json({ status: "error", message: "Invalid email or password!" });
	}

	const accessJWT = await crateAccessJWT(Team.email,`${Team._id}`);
	const refreshJWT = await crateTeamRefreshJWT(Team.email,`${Team._id}`);

	res.json({
		status: "success",
		message: "Login Successfully!",
		accessJWT,
		refreshJWT,
	});
});
//Team reset password
router.post("/reset-password", resetPassReqValidation, async (req, res) => {
	const { email } = req.body;

	const Team = await getTeamByEmail(email);

	if (Team && Team._id) {
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

//Team password update
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

		const Team = await updatePassword(email, hashedPass);

		if (Team._id) {
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

// Team logout and invalidate jwts

router.delete("/logout", teamAuthorization, async (req, res) => {
	const { authorization } = req.headers;
	//this data coming form database
	const _id = req.userId;

	// 2. delete accessJWT from redis database
	deleteJWT(authorization);

	// 3. delete refreshJWT from mongodb
	const result = await storeTeamRefreshJWT(_id, "");

	if (result._id) {
		return res.json({ status: "success", message: "Loged out successfully" });
	}

	res.json({
		status: "error",
		message: "Unable to logg you out, plz try again later",
	});
});

module.exports=router;