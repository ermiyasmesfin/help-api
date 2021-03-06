const express = require("express");
const {route}=require("./ticket.router");
const router = express.Router();

const{insertUser,getUserByEmail,getUserById}=require("../model/user/User.model");
const{hashPassword,comparePassword}=require("../helpers/bcrypt.helper");
const{crateAccessJWT,crateRefreshJWT}=require("../helpers/jwt.helpers");
const {userAuthorization}=require("../middlewares/autherization.middleware");
const { setPasswordRestPin, deletePin, getPinByEmailPin } = require("../model/restPin/RestPin.model");
const { emailProcessor } = require("../helpers/email.helper");
const { resetPassReqValidation, updatePassValidation } = require("../middlewares/formValidation.middleware");
const { updatePassword ,storeUserRefreshJWT} = require("../model/user/User.model");
const { deleteJWT } = require("../helpers/redis.helpers");


//get user profile router
router.get("/",userAuthorization,async(req,res)=>{
	///this data came from database

	const _id=req.userId
	
	const userProf=await getUserById(_id)
	const {name,email}=userProf;
	//3extract user id
    //4get user profile based on the user id
		res.json({user:{
		_id,
		name,
		email,
		}
		
		})
})




//create new user route
router.all("/",(req,res,next) => {

    
   // res.json({message:"return from user"});
   next();
});

router.post("/",async(req,res)=>{
    const{name,company,address,phone,email,password}=req.body;


    try{
        //hashpassword
        const hashedPass=await hashPassword(password);

        const newUserObj={
            name,
            company,
            address,
            phone,
            email,
            password:hashedPass,
        };

        const result=await insertUser(newUserObj);
        console.log(result);

        res.json({message:"New user created ",result});
    }catch (error){
        console.log(error);
        res.json({status:"error",message: error.message});
    }
});

//User sign in Router
router.post("/login", async (req, res) => {
	console.log(req.body);
	const { email, password } = req.body;

	if (!email || !password) {
		return res.json({ status: "error", message: "Invalid form submition!" });
	}

	const user = await getUserByEmail(email);
	console.log(user);
	

	// if (!user.isVerified) {
	// 	return res.json({
	// 		status: "error",
	// 		message:
	// 			"You account has not been verified. Please check your email and verify you account before able to login!",
	// 	});
	// }

	const passFromDb = user && user._id ? user.password : null;

	if (!passFromDb)
		return res.json({ status: "error", message: "Invalid email or password!" });

	const result = await comparePassword(password, passFromDb);
	console.log(result);

	if (!result) {
		return res.json({ status: "error", message: "Invalid email or password!" });
	}

	const accessJWT = await crateAccessJWT(user.email,`${user._id}`);
	const refreshJWT = await crateRefreshJWT(user.email,`${user._id}`);

	res.json({
		status: "success",
		message: "Login Successfully!",
		accessJWT,
		refreshJWT,
	});
});
//user reset password
router.post("/reset-password", resetPassReqValidation, async (req, res) => {
	const { email } = req.body;

	const user = await getUserByEmail(email);

	if (user && user._id) {
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

//user password update
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

		const user = await updatePassword(email, hashedPass);

		if (user._id) {
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

// User logout and invalidate jwts

router.delete("/logout", userAuthorization, async (req, res) => {
	const { authorization } = req.headers;
	//this data coming form database
	const _id = req.userId;

	// 2. delete accessJWT from redis database
	deleteJWT(authorization);

	// 3. delete refreshJWT from mongodb
	const result = await storeUserRefreshJWT(_id, "");

	if (result._id) {
		return res.json({ status: "success", message: "Loged out successfully" });
	}

	res.json({
		status: "error",
		message: "Unable to logg you out, plz try again later",
	});
});

module.exports=router;