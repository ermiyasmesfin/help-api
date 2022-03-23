const mongoose = require("mongoose");
const Schema=mongoose.Schema;

const TeamSchema =new Schema({
    name:{
        type:String,
        maxlength:50,
        required:true,
    },
    company:{
        type:String,
        maxlength:50,
        required:true,
    },
    address:{
        type:String,
        maxlength:100,
    },
    phone:{
        type:Number,
        maxlength:12,
    },
    email:{
        type:String,
        maxlength:50,
        required:true,
    },
    password:{
        type:String,
        minlength:8,
        maxlength:200,
        required:true,
    },
    refreshJWT: {
        token: {
          type: String,
          maxlength: 500,
          default: "",
        },
        addedAt: {
          type: Date,
          required: true,
          default: Date.now(),
        },
      },

});
module.exports={
    TeamSchema:mongoose.model("Team",TeamSchema),
};