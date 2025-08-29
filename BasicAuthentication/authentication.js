require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const PORT = 3000;
const app = express();
const JWT_SECRET = process.env.JWT_SECRET;
const DATABASE_URL = process.env.DATABASE_URL;
app.use(express.json());
const users = [
    { username: "Pushpender", password: "12345", role: "admin" }
];

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer')) {
            return res.status(401).json({
                success: "false",
                message: "No Token Provided or Invalid format.",


            });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: "false", error: "Token not present." })
        }
        const decode = jwt.verify(token, JWT_SECRET);
        console.log(decode);
        req.user = decode;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.',
                error: 'Token verification failed' + error
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired.',
                error: 'Please login again'
            });
        }
    }
}

const authorize = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json("Forbidden! Access Denied!");
        } next();
    }
}


app.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password) {
        return res.status(401).json({
            success: false,
            error: "Username or Password must be Entered!"
        });
    }


    try {
        const existing = await prisma.user.findFirst({
            where: {
                username: username
            }
        });
        if (existing) {
            return res.status(401).json({
                success: false,
                error: `User Already Exist with username: ${username}`

            })
        }
        const hashedPassword = await bcrypt.hash(password,10);
        const newUser = await prisma.user.create({
            data: {
                username: username,
                password: hashedPassword,
                role: role
            }

        })
        const token = jwt.sign(
            { username: username, role: role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        return res.status(201).json({
            success: true,
            msg: "User Registered Successfully!",
            user: newUser,
            token: token
        })

    } catch (error) {
        return res.status(401).json({
            success: false,
            error: error
        });
    }




})
app.post('/login', async(req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({
            success:false,
            error:"Username or Password Missing!"
        });
    }
    try{
        const existing = await prisma.user.findFirst({
            where:{
                username:username
            }
        });
        if(!existing){
            return res.status(404).json({
                success:false,
                error:`User Not Found with username: ${username}`
            });
        }
        const isvalidPass = await bcrypt.compare(password,existing.password);
        if(isvalidPass){
            const token = jwt.sign(
                { username: existing.username, role: existing.role },
                JWT_SECRET,
                { expiresIn: '1h' }
            );
            return res.status(201).json({
                success:true,
                msg:"User Logged in Successfully",
                user:existing,
                token:token
            })
        }else{
            res.status(401).json({
                success:false,
                error:"Wrong Password! Try Again."
            })
        }
    }catch(error){
        res.status(403).json({
            success:false,
            error:"Error while Log in!"
        })
    }

})

app.get('/profile', authenticate, (req, res) => {
    const name = req.user.username;
    return res.status(201).json(`Welcome User: ${name}`);
})
app.get('/admin', authenticate, authorize(['admin']), (req, res) => {
    res.status(201).json({
        msg: "yes You are admin."
    })
})
app.listen(PORT, () => {
    console.log('Listening on Port:3000');
})