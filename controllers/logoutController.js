const usersDB = {
    users: require('../model/users.json'),
    setUsers: function (data) { this.users = data }
}

const fsPromises = require('fs').promises;
const path = require('path');

const jwt = require('jsonwebtoken');
require('dotenv').config();

const handleLogout = async (req, res) => {
    // On client, also delete the access token
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.status(204).json(); //No content
    
    const refreshToken = cookies.jwt;

    // Is refreshToken in DB?
    const foundUser = usersDB.users.find(person => person.refreshToken === refreshToken);
    if (!foundUser) {
        res.clearCookie('jwt', { httpOnly: true });
        return res.status(204).json(); // No content
    }

    // Delete refreshToken in DB
    const otherUsers = usersDB.users.filter(person => person.refreshToken !== refreshToken);
    const currentUser = { ...foundUser, refreshToken: '' };
    const updatedUsers = [...otherUsers, currentUser];
    usersDB.setUsers(updatedUsers);

    await fsPromises.writeFile(
        path.join(__dirname, '..', 'model', 'users.json'),
        JSON.stringify(usersDB.users)
    );

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true }); // secure: true - only serves on https
    res.status(204).json(); // No content
}

module.exports = { handleLogout };