const usersDB = {
    users: require('../model/users.json'),
    setUsers: function (data) { this.users = data }
}
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');
require('dotenv').config();

const fsPromises = require('fs').promises;
const path = require('path');


const handleLogin = async (req, res) => {
    const { user, pwd } = req.body;
    console.log('user:', user, 'pwd:', pwd);
    if (!user || !pwd) return res.status(400).json({ 'message': 'Username and password are required.' });
    const foundUser = usersDB.users.find(person => person.username === user);
    if (!foundUser) return res.sendStatus(401); //Unauthorized 
    // evaluate password 
    const match = await bcrypt.compare(pwd, foundUser.password);
    if (match) {
        // create JWTs
        const accessToken = jwt.sign(
            {"username": foundUser.username}, 
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1h' }
        );

        const refreshToken = jwt.sign(
            {"username": foundUser.username}, 
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );

        // find other users except the logged in user
        const otherUsers = usersDB.users.filter(person => person.username !== foundUser.username);

        const currentUser = { ...foundUser, refreshToken };

        // update the users array
        usersDB.setUsers([...otherUsers, currentUser]);

        usersDB.setUsers([...usersDB.users]);

        // save the updated users array to the json file
        await fsPromises.writeFile(
            path.join(__dirname, '..', 'model', 'users.json'),
            JSON.stringify(usersDB.users)
        )

        res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 }); //1 day

        res.json({ accessToken });
    } else {
        res.sendStatus(401);
    }
}

module.exports = { handleLogin };