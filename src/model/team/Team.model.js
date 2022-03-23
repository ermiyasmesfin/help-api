const { reject } = require("bcrypt/promises");
const {TeamSchema}=require("./Team.schema");

const insertTeam=(TeamObj)=>{
    return new Promise((resolve, reject)=>{
        TeamSchema(TeamObj)
        .save()
        .then((data)=>resolve(data))
        .catch((error)=>reject(error));
    });
};
const getTeamByEmail = (email) => {
    return new Promise((resolve, reject) => {
      if (!email) return false;
  
      try {
        TeamSchema.findOne({ email }, (error, data) => {
          if (error) {
            
            reject(error);
          }
          resolve(data);
        });
      } catch (error) {
        reject(error);
      }
    });
  };
  const getTeamById = (_id) => {
    return new Promise((resolve, reject) => {
      if (!_id) return false;
  
      try {
        TeamSchema.findOne({ _id }, (error, data) => {
          if (error) {
            
            reject(error);
          }
          resolve(data);
        });
      } catch (error) {
        reject(error);
      }
    });
  };

  const storeTeamRefreshJWT = (_id, token) => {
    return new Promise((resolve, reject) => {
      try {
        TeamSchema.findOneAndUpdate(
          { _id },
          {
            $set: { "refreshJWT.token": token, "refreshJWT.addedAt": Date.now() },
          },
          { new: true }
        )
          .then((data) => resolve(data))
          .catch((error) => {
            console.log(error);
            reject(error);
          });
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }; 
  const updatePassword = (email, newhashedPass) => {
    return new Promise((resolve, reject) => {
      try {
        TeamSchema.findOneAndUpdate(
          { email },
          {
            $set: { password: newhashedPass },
          },
          { new: true }
        )
          .then((data) => resolve(data))
          .catch((error) => {
            console.log(error);
            reject(error);
          });
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  };
module.exports={
    insertTeam,
    getTeamByEmail,
   storeTeamRefreshJWT,
   getTeamById,
   updatePassword,
};