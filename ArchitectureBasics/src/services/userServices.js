const bcrypt = require('bcrypt');
const userRepository = require('../repositories/userRepository')
const jwt = require('../utils/jwt')

async function register(data) {
    console.log(data);
    const existing = await userRepository.findByName(data.username);
    if (existing) {
        throw new Error(`User Already Registered with username: ${data.username}`);
    }
    const hashed = await bcrypt.hash(data.password, 10);
    const newUser = await userRepository.createUser({ ...data, password: hashed });
    const token = await jwt.signToken({ username: data.username });
    return { token };


}

async function login(data) {
    const existing = await userRepository.findByName(data.username);
    if (!existing) {
        throw new Error(`User not Found with username: ${data.username}`);
    }
    const match = await bcrypt.compare(data.password, existing.password);
    if (!match) {
        throw new Error("Invalid Credentials!");
    }
    const token = await jwt.signToken({ username: existing.username });
    return { token };
}

module.exports = { register, login };