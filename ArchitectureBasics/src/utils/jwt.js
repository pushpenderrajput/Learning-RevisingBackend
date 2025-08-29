const jsonwebtoken = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

async function signToken(userData){
    const result = jsonwebtoken.sign(
        userData,
        JWT_SECRET,
        { expiresIn: '1h' }
    )
    return result;

}


async function verifyToken(token){
    const result = jsonwebtoken.verify(token,JWT_SECRET);
    return result;
}

module.exports = {signToken,verifyToken};