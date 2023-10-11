const express = require('express');
require('dotenv').config();
const cors = require('cors');
const usersRouter=require('./routes/users');

class Server{
    constructor(){
        this.app=express(); //instancia de express
        this.port=process.env.PORT;     //puerto para el servidor

        //http://localhost:3000/api/v1/users
        this.basePath='/api/v1'
        this.usersPath=`${this.basePath}/users`;

        this.middlewares();
        this.routes();

    }

    middlewares(){
        this.app.use(cors());
        this.app.use(express.json()); //para poder interpretar texto
    }

    routes(){
        this.app.use(this.usersPath,usersRouter);
    }

    listen(){
        this.app.listen(this.port,()=>{
            console.log("Listening on port "+this.post);
        })
    }
}
module.exports = Server;