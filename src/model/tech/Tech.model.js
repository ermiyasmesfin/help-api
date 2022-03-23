const { reject } = require("bcrypt/promises");
const {TechSchema}=require("./Tech.schema");

const insertTech=(techObj)=>{
    return new Promise((resolve, reject)=>{
        TechSchema(techObj)
        .save()
        .then((data)=>resolve(data))
        .catch((error)=>reject(error));
    });
};
const getTechByEmail = (email) => {
    return new Promise((resolve, reject) => {
      if (!email) return false;
  
      try {
        TechSchema.findOne({ email }, (error, data) => {
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
  const getTech = () => {
    return new Promise((resolve, reject) => {
      // if () return false;
  
      try {
        TechSchema.find({ }, (error, data) => {
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







  const getTechById = (_id) => {
    return new Promise((resolve, reject) => {
      if (!_id) return false;
  
      try {
        TechSchema.findOne({ _id }, (error, data) => {
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

  const storeTechRefreshJWT = (_id, token) => {
    return new Promise((resolve, reject) => {
      try {
        TechSchema.findOneAndUpdate(
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
        TechSchema.findOneAndUpdate(
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
    insertTech,
    getTech,
    getTechByEmail,
   storeTechRefreshJWT,
   getTechById,
   updatePassword,
};