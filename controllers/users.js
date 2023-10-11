const {request,response, json} = require('express');
const pool = require('../db');
const usersModel = require('../models/users');


const usersList= async(req = request,res=response)=>{
    let conn;
    try {
        conn = await pool.getConnection();
        
        const users = await conn.query(usersModel.getAll,(err)=>{
            if(err){
                throw new Error(err);    //si se encuentra la variable error llena se manda al catch
            }
        })

        res.json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
        
    }finally{
        if(conn) conn.end();
    }
}

const listUserByID= async(req = request,res=response)=>{
    const{id}=req.params;

    if(isNaN(id)){
        res.status(400).json({msg:'Invalid ID'});
        return;
    }
    let conn;
    try {
        conn = await pool.getConnection();
        
        const [user] = await conn.query(usersModel.getByID,[id],(err)=>{  //[] en user es para que o muestre 0
            if(err){
                throw new Error(err);    //si se encuentra la variable error llena se manda al catch
            }
        })

        if(!user){
            res.status(404).json({msg:'User not found'});
            return;
        }

        res.json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
        
    }finally{
        if(conn) conn.end();
    }
}

module.exports={usersList,listUserByID};