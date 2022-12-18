const mongoose=require('mongoose');
mongoose.connect('mongodb://localhost:27017/alumini-network',{
useUnifiedTopology: true,
useNewUrlParser: true   
},(err)=>{
if(err){console.log("error in db connection", +err)}
else{console.log("database connected")}  
});

