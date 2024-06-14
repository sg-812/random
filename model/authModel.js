const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AuthSchema = new Schema({
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true
    },
    gender:{
        type:String,
        required:true
    },
    dob:{
       type:Date,
       required:true
    },
    email:{
        type:String,
        required:true
    },
   password:{
        type:String,
        required:true
    },
    contact:{
        type:Number,
        required:false
    },
    user_image:{
        type:String,
        required:false
    },
    identity_proof:{
        type:String,
        required:true
    },
    isVerified:{
        type:Boolean,
        default:false
    }
},{
    timestamps: true,
    versionKey: false
});

const AuthModel = new mongoose.model("auth_details", AuthSchema);  //collection name/model name,schema name
module.exports = AuthModel;