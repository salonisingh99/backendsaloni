const express= require('express');
const cors= require('cors');
const bodyparser= require('body-parser');
const port=process.env.PORT || 5000;
require('./model/db')

const api = require('./controller/index');
const app=express();
app.use(cors());
app.use(bodyparser.urlencoded({extended:true}))
app.use(bodyparser.json());

app.use('/',api)

app.listen(port,()=>{
    console.log(`server is running at the port: ${port}`);
})