const mongoose = require('mongoose');
const RegisterSchema = mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    password:{
         type:String,
         required:true
    },
    email:{
        type:String,
        required:true
    },
    role:{
        type:String
    },
    phone:
    {
        type:String,
    },
    college:
    {
        type:String,
    },
    company:
    {
        type:String,
    },
    batch:
    {
        type:String,
    },
    profile:
    {
        type:String,
    }
}); 

const model = mongoose.model('Register',RegisterSchema);

module.exports = model;