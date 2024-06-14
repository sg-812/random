require('dotenv').config();

const express=require('express')
const appServer=express();
const path=require('path');

const mongoose=require('mongoose');
const PORT=process.env.PORT||1000;
// console.log(PORT,"Port");

const flash = require('connect-flash');

// session package is used to store user information in memory but it has no infinite resource
const session=require('express-session');       
const mongodb_session=require('connect-mongodb-session')(session);  //used to store data in a session  

const AuthModel=require('./model/authModel')
// routing
const adminRouting=require('./router/adminRouter')
const userRouting=require('./router/userRouter');
const authRouting=require('./router/authRouter');

// view
appServer.set('view engine','ejs');
appServer.set('views','view');

// parsing
appServer.use(express.urlencoded({extended:true}))

// flash
appServer.use(flash());

// public folder
appServer.use(express.static(path.join(__dirname,'public')))
appServer.use(express.static(path.join(__dirname,'uploads')))

// session
//to store data in mongodb session collection
const session_store=new mongodb_session({
	uri:process.env.DB_URL,
	collection:'auth-session'
})
//session is function here. to stop resaving, resave value false to stop storing uninitialized value, saveUninitialized:false
appServer.use(session({
	secret:'project-secret-key',
	resave:false,
	saveUninitialized:false,
	store:session_store}))  


appServer.use(async (req,res,next) => {
	if(!req.session.user) 
	{
	   return next(); //next will return the next middleware function
	}
	let userValue=await AuthModel.findById(req.session.user._id)
	if(userValue){
        req.user = userValue;
		// console.log('User details: ' ,req.user)
		next();
    }else{        
		console.log("User not found")
    }
});

appServer.use(adminRouting);
appServer.use(userRouting);
appServer.use(authRouting)
// Since this is the last non-error-handling middleware use()d, we assume 404, as nothing else responded.
// the status option, or res.statusCode = 404  are equivalent, however with the option we get the "status" local available as well


appServer.use((req,res)=>{
    res.send('<h1>PAGE  NOT FOUND!! Please recheck.</h1>')
})

mongoose.connect(process.env.DB_URL)
.then(res=>{
    console.log("Database connected successfully");
    appServer.listen(PORT,()=>{
        console.log(`Server running at http://localhost:${PORT}`);
    })
})
.catch(err=>{
   console.log(err);
})

