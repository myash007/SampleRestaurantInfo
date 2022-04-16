const jwt = require('jsonwebtoken');
require('dotenv').config()
var key = process.env.SECRET_KEY;

//Check if user is logged in or not by checking the cookie token 
const isLoggedIn = (req,res,next) => {
    const token = req.cookies.jwt;
    if(token){
        //verify token using the secret key
        jwt.verify(token, key , (err,decodedToken) => {
            if(err){//if token is not valid redirect to login page
                console.log(err.message);
                res.redirect('/api/login');
            }
            else{ //if token is verified then redirect to pagination form 
                
                // console.log("id: " + decodedToken.id + ",role: " + decodedToken.role);
                res.status(200).redirect('/api/paginationformHandlebar');
            }
        })
    }else{
        next();
    }
}

module.exports = { isLoggedIn };

