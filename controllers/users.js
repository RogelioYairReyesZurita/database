const {request, response} = require('express');
const bcrypt = require('bcrypt');
const usermodels = require('../models/users');
const pool=require('../db');


const listUsers = async (req = request, res = response) => {
    let conn; 

    try{
        conn = await pool.getConnection();

    const users = await conn.query (usermodels.getAll, (err)=>{
        if(err){
            throw err
        }
    });

    res.json(users);
    } catch (error){
        console.log(error);
        res.status(500).json(error);
    } finally{
        if (conn) conn.end();
    }
    
}
////////////////////////////añardir usuario/////////////////////////////////////////////
const listUsersByID = async (req = request, res = response) => {
    const {id} = req.params;

    if (isNaN(id)) {
        res.status(400).json({msg: 'Invalid ID'});
        return;
    }


    let conn; 

    try{
        conn = await pool.getConnection();

    const [user] = await conn.query (usermodels.getByID, [id], (err)=>{
        if(err){
            throw err
        }
    });

    if (!user) {
        res.status(404).json({msg: 'User not foud'});
        return;
    }

    res.json(user);
    } catch (error){
        console.log(error);
        res.status(500).json(error);
    } finally{
        if (conn) conn.end();
    }
}

const addUser =async(req = request, res= response)=>{
    let conn;
    const {
        username,
        email,
        password,
        name,
        lastname,
        phone_number ='',
        role_id,
        is_active =1
    } = req.body;
    if (!username|| !email|| !password|| !name|| !lastname|| !role_id){
res.status(400).json({msg:'Missing informarion'});
return;
        }
        const saltRounds=10;
        const passwordHash= await bcrypt.hash(password,saltRounds);

        const user= [username, email, passwordHash, name, lastname, phone_number, role_id, is_active];
    
    try {
        conn = await pool.getConnection();

        const [usernameUser] = await conn.query(
            usermodels.getByUsername,
            [username],
            (err)=>{if(err) throw err;}
        );
        if(usernameUser){
            res.status(409).json({msg:`User with username ${username} alredy exists`});
            return;
        }

        const [emailUser] = await conn.query(
            usermodels.getByEmail,
            [email],
            (err)=>{if(err) throw err;}
        );
        if(emailUser){
            res.status(409).json({msg:`User with email ${email} alredy exists`});
            return;
        }
        const userAdded = await conn.query(usermodels.addRow,[...user],(err)=>{})
        
        if(userAdded.affectedRow === 0)throw new Error({msg:'Failed to add user'});
        res.json({msg:'User updated succesfully'});
    }catch(error){
console.log(error);
res.status(500).json(error);
    } finally {
        if (conn) conn.end();
    }
}

/////////////////////////////Modifica Usuario//////////////////////////////////////////////////

const ModUser=async(req, res)=>{
    const {
        username,
        email,
        password,
        name,
        lastname,
        phone_number,
        role_id,
        id_active,
    } = req.body;

const {id} = req.params;

let passwordHash;
if(password){
    const saltRounds=10;
    passwordHash=await bcrypt.hash(password,saltRounds);
}

let newUserData=[
    username,
    email,
    passwordHash,
    name,
    lastname,
    phone_number,
    role_id,
    id_active   
];
let conn;
try{
    conn = await pool.getConnection();
const [userExists]=await conn.query(
    usermodels.getByID,
    [id],
    (err) => {if (err) throw err;}
);
if (!userExists || userExists.id_active === 0){
    res.status(404).json({msg:'User not found'});
    return;
}

const [usernameUser] = await conn.query(
    usermodels.getByUsername,
    [username],
    (err) => {if (err) throw err;}
);
if (usernameUser){
    res.status(409).json({msg:`User with username ${username} already exists`});
    return;
}

const [emailUser] = await conn.query(
    usermodels.getByEmail,
    [email],
    (err) => {if (err) throw err;}
);
if (emailUser){
    res.status(409).json({msg:`User with email ${email} already exists`});
    return;
}

const oldUserData = [
    userExists.username,
    userExists.email,
    userExists.password,
    userExists.name,
    userExists.lastname,
    userExists.phone_number,
    userExists.role_id,
    userExists.id_active  
];

newUserData.forEach((userData, index)=> {
    if (!userData){
        newUserData[index] = oldUserData[index];
    }
})

const userUpdate = await conn.query(
    usermodels.getActuData,
    [...newUserData, id],
    (err) => {if (err) throw err;}
);
if(userUpdate.affecteRows === 0){
    throw new Error ('User not updated');
}
res.json({msg:'User updated successfully'})
}catch (error){
        console.log(error);
        res.status(500).json(error);
    } finally{
        if (conn) conn.end();
    }
}





/////////////////////////////////eliminar dato/////////////////////////////////////////////////////////

    const Deleteuser = async (req=request,res=response)=>{
        let conn;
        try {
            conn= await pool.getConnection();
            const {id}=req.params;

            const[userExists]=await conn.query(
                usermodels.getByID,
                [id],
                (err)=>{if(err) throw err;}
            );
            if(!userExists||userExists.is_active ===0){
                res.status(404).json({msg: 'User not found'})
                return;
            }
            const userDelete = await conn.query(
                usermodels.deleteRow,
                [id],
                (err)=>{if(err) throw err;}
            );
            if(userDelete.affectedRow===0){
                throw new Error({msg: 'Failed to delete user'});
            }
            res.json({msg:'User delete succesfelly'});

        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }finally{
            if(conn) conn.end();
        }
    }

module.exports={listUsers, listUsersByID, addUser,ModUser,Deleteuser};