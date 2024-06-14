const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TokenSchema = new Schema({
    _userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'auth_details'
        //The ref option is what tells Mongoose which model to use during 
        //population(Reference of another schema)
    },
    token: {
        type: String,
        required: true
    }
});

const TokenModel = new mongoose.model("token_details", TokenSchema);
module.exports = TokenModel;