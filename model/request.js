const mongoose = require('mongoose');
const RequestSchema = mongoose.Schema({
    sendBy:{
        type:String,
        required:true
    },
    sendTo:{
         type:String,
         required:true
    },
    status:{
        type:String,
        required:true
    }
}); 

const model = mongoose.model('Request',RequestSchema);

module.exports = model;