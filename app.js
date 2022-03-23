require("dotenv").config();
const express = require("express");
const app =express();
const bodyParser = require("body-Parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const port = process.env.PORT || 3001;

//api security
//app.use(helmet())

//handele cors error
app.use(cors())

//mongoDB connection setup
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URL,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
   
    
})

if (process.env.NODE_ENV !=="production"){
    const mDB=mongoose.connection;
    mDB.on("open",()=>{
        console.log("mongoDB is connected");
    });
    mDB.on("error",(error)=>{
        console.log(error);
    });

    //logger
app.use(morgan("tiny"))
}



//set body parser

app.use(bodyParser({extended:true}));
app.use(bodyParser.json());

//load router
const userRouter = require("./src/routers/user.router");
const techRouter = require("./src/routers/tech.router");
const teamRouter = require("./src/routers/team.router");
const ticketRouter = require("./src/routers/ticket.router");
const tokensRouter = require("./src/routers/tokens.router");


//use router
app.use("/v1/user",userRouter)
app.use("/v1/tech",techRouter)
app.use("/v1/team",teamRouter)
app.use("/v1/ticket",ticketRouter)
app.use("/v1/tokens",tokensRouter)


//Error handler
const handleError=require("./src/utils/errorHandler");




app.use("*",(req,res,next)=>{
    const error= new Error("resources not found");
    error.status=404
    next(error);
   
});
app.use((error,req,res,next)=>{
    handleError(error,res)

})
app.listen(port,()=>{
    console.log(`API is ready on http://localhost:${port}`);
});