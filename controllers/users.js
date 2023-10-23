const {request, response} = require('express');
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
        const user= [username, email, password, name, lastname, phone_number, role_id, is_active]
    
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

const ModUser = async (req, res) => {
    const { id } = req.params;
    const DatosDeUsuario = req.body; // Actualizamos los datos
  
    if (!DatosDeUsuario || DatosDeUsuario=== 0) {
      return res.status(400).json({ msg: 'No data provided for update' });
    }
    
    let conn;
    try {
      conn = await pool.getConnection();
  
      //Aqui se verifica si el usuario esta verificado
      const [IdUserYes] = await conn.query(usermodels.getByID, [id]);
      if (!IdUserYes) {
        return res.status(404).json({ msg: 'User not found' });
      }
  
      // Realiza las validaciones necesarias, por ejemplo, que el correo o el nombre de usuario no estén en uso
      
      if (DatosDeUsuario.username) {
        const [ChecaIdUser] = await conn.query(
            usermodels.getActualUser,
          [DatosDeUsuario.username]
        );
        if (ChecaIdUser && ChecaIdUser.id !== id) {
          return res.status(409).json({ msg: 'Username already in use' });
        }
      }
      if (DatosDeUsuario.email) {
        const [ChecaEmailUser] = await conn.query(
            usermodels.getActualEmail,
          [DatosDeUsuario.email]
        );
        if (ChecaEmailUser && ChecaEmailUser.id !== id) {
          return res.status(409).json({ msg: 'Email already in use' });
        }
      }
  
      // Realiza la actualización de los campos permitidos
      const DatosUser = ['username', 'email', 'password', 'name', 'lastname', 'phone_number','role_id',"is_active"];
      const updateData = {};


  
      DatosUser.forEach((field) => {
        if (DatosDeUsuario[field] !== undefined) {
          updateData[field] = DatosDeUsuario[field];
        }
      });
      
      if (!updateData.username|| !updateData.email|| !updateData.password|| !updateData.name|| !updateData.lastname|| !updateData.role_id){
        res.status(400).json({msg:'Missing informarion'});
        return;}
        
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ msg: 'No valid fields to update' });
      }
  
      // Utiliza la consulta ModUser para realizar la actualización
      const DatosActu = await conn.query(
        usermodels.getActuData,
        [
          updateData.username,
          updateData.email,
          updateData.password, // Actualizar contraseña
          updateData.name,
          updateData.lastname,
          updateData.phone_number,
          updateData.role_id,
          updateData.is_active,
          id
        ]
      );
  
      if (DatosActu.affectedRows === 0) {
        return res.status(500).json({ msg: 'Failed to update user' });
      }
      
      return res.json({ msg: 'User updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json(error);
    } finally {
      if (conn) conn.end();
    }
  };





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