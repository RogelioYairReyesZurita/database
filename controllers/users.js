const {request,response} = require('express');
const connection = require('../db');

const usersList=(req = request,res=response)=>{
    try {
        connection.connect(async(err)=>{
            if(err){
                throw new Error(err);
            }else{
                const users = await connection.execute('SELECT * FROM Users',(err)=>{
                    if(err){
                        throw new Error(err);
                    }
                })

                res.json(users);
            }
        })
    } catch (err) {

        res.status(500).json({msg:"Error connection to MySQL database"});
        
    }finally{
        connection.end();
    }


   

}

module.exports={usersList};