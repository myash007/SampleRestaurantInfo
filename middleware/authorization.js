const jwt = require('jsonwebtoken');
require('dotenv').config()
var key = process.env.SECRET_KEY;

const authAdmin = (req,res,next) => {
    const token = req.cookies.jwt;
    if(token){
        jwt.verify(token, key , (err,decodedToken) => {
            if(err){
                console.log(err.message);
                res.redirect('/api/login');
            }
            else{
                // console.log("id: " + decodedToken.id + ",role: " + decodedToken.role);
                const role = decodedToken.role;
                if(role == "admin"){
                    next();
                }
                else{
                    res.status(400).send("Access denied you cannot access this site!");
                }
            }
        })
    }else{
        res.redirect('/api/login');
    }
}

const authUser = (req,res,next) => {
    const token = req.cookies.jwt;
    if(token){
        jwt.verify(token, key , (err,decodedToken) => {
            if(err){
                console.log(err.message);
                res.redirect('/api/login');
            }
            else{
                // console.log("id: " + decodedToken.id + ",role: " + decodedToken.role);
                const role = decodedToken.role;
                if(role == "user" || role == "admin") {
                    next();
                }
            }
        })
    }else{
        res.redirect('/api/login');
    }
}

module.exports = { authAdmin,authUser };

