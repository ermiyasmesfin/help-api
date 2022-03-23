const jwt = require("jsonwebtoken");
const { setJWT, getJWT, } = require("./redis.helpers");
const { storeUserRefreshJWT } = require("../model/user/User.model");
const { storeTechRefreshJWT } = require("../model/tech/Tech.model");
const{storeTeamRefreshJWT} =require("../model/team/Team.model")
//const { token } = require("morgan");




const crateAccessJWT = async (email,_id) => {
  try {
    const accessJWT = await jwt.sign({ email }, process.env.JWT_ACCESS_SECRET, {
      expiresIn: "15m",
    });
    await setJWT(accessJWT,_id)
      return Promise.resolve(accessJWT);
    
  } catch (error) {
    
    return Promise.reject(error);
  }
  
}
const crateRefreshJWT = async (email,_id) => {

  try {
    const refreshJWT = await jwt.sign({email}, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "30d",
    });

    storeUserRefreshJWT(_id,refreshJWT)
      return Promise.resolve(refreshJWT);
    
  } catch (error) {
    return Promise.reject(error);
    
  }
 
};
const verifyAccessJWT = (userJWT) => {
  try {
    return Promise.resolve(jwt.verify(userJWT, process.env.JWT_ACCESS_SECRET));
  } catch (error) {
    return Promise.resolve(error);
  }
};
const verifyRefreshJWT = (userJWT) => {
  try {
    return Promise.resolve(jwt.verify(userJWT, process.env.JWT_REFRESH_SECRET));
  } catch (error) {
    return Promise.resolve(error);
  }
};



const crateTechRefreshJWT = async (email,_id) => {

  try {
    const refreshJWT = await jwt.sign({email}, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "30d",
    });

    storeTechRefreshJWT(_id,refreshJWT)
      return Promise.resolve(refreshJWT);
    
  } catch (error) {
    return Promise.reject(error);
    
  }
 
};
const verifyTechAccessJWT = (techJWT) => {
  try {
    return Promise.resolve(jwt.verify(techJWT, process.env.JWT_ACCESS_SECRET));
  } catch (error) {
    return Promise.resolve(error);
  }
};
const verifyTechRefreshJWT = (techJWT) => {
  try {
    return Promise.resolve(jwt.verify(techJWT, process.env.JWT_REFRESH_SECRET));
  } catch (error) {
    return Promise.resolve(error);
  }
};




const crateTeamRefreshJWT = async (email,_id) => {

  try {
    const refreshJWT = await jwt.sign({email}, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "30d",
    });

    storeTeamRefreshJWT(_id,refreshJWT)
      return Promise.resolve(refreshJWT);
    
  } catch (error) {
    return Promise.reject(error);
    
  }
 
};
const verifyTeamAccessJWT = (teamJWT) => {
  try {
    return Promise.resolve(jwt.verify(teamJWT, process.env.JWT_ACCESS_SECRET));
  } catch (error) {
    return Promise.resolve(error);
  }
};
const verifyTeamRefreshJWT = (teamJWT) => {
  try {
    return Promise.resolve(jwt.verify(teamJWT, process.env.JWT_REFRESH_SECRET));
  } catch (error) {
    return Promise.resolve(error);
  }
};



module.exports = {
  crateAccessJWT,
  crateRefreshJWT,
  verifyAccessJWT,
  crateTechRefreshJWT,
  verifyTechAccessJWT,
  verifyRefreshJWT,
  verifyTechRefreshJWT,

  crateTeamRefreshJWT,
  verifyTeamAccessJWT,
  verifyTeamRefreshJWT,
};
