const jwt = require('jsonwebtoken');
require('dotenv').config()
var key = process.env.SECRET_KEY;

//authorize admin to handle all routes 
const authAdmin = (req,res,next) => {
    const token = req.cookies.jwt;
    if(token){ //verify token and check role if user role is admin then allow access for all routes 
        jwt.verify(token, key , (err,decodedToken) => {
            if(err){
                console.log(err.message);
                res.redirect('/api/login');
            }
            else{
                // console.log("id: " + decodedToken.id + ",role: " + decodedToken.role);
                const role = decodedToken.role; //get decoded token and get role to check the user role
                if(role == "admin"){
                    next();
                }
                else{ //if user role is user then show access denied message for insert, update and delete operations
                    res.status(400).send("Access denied you cannot access this site!");
                }
            }
        })
    }else{
        res.redirect('/api/login');
    }
}

//authorize user to access only view restaurant details and deny the access for insert,update and delete operations
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

//exporting middlewares
module.exports = { authAdmin,authUser };

