const userService = require('../services/userServices');

async function registerUser(req,res){
    try{
        const result = await userService.register(req.body);
        console.log(req.body);
        res.status(201).json(result);
    }catch(error){
        res.status(400).json({error:error.message});
    }
}
async function loginUser(req,res){
    try{
        const result = await userService.login(req.body);
        res.status(201).json(result);
    }catch(error){
        res.status(400).json({error:error.message});
    }
}

module.exports = {registerUser,loginUser};