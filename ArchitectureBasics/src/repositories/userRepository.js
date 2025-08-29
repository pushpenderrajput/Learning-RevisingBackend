const mysql = require('mysql2/promise');
const connection = mysql.createPool({
    host:"localhost",
    user:'pushpender',
    password:'pushpender',
    database: 'mydatabase'
});

async function findByName(username){
    try{
        const [rows] = await connection.query('SELECT * FROM user WHERE username = ?',[username]);
        // console.log(existing)
        return rows[0];
        
    }catch(error){
        throw new Error(error.message);
    }
    
   
}

async function createUser(data){
    try{
        const existing = await findByName(data.username);
        if(existing){
            throw new Error('User Already Registered!');
        }
            
        const [result] = await connection.query(
            'INSERT INTO user (username, password) VALUES (?, ?)',
            [data.username, data.password]
        );
        return result;
        
        
    }catch(error){
        throw new Error(error.message);
    }
    

}


module.exports = {findByName,createUser};