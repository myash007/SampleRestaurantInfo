const jwt = require('jsonwebtoken');
require('dotenv').config()
var key = process.env.SECRET_KEY;

const isLoggedIn = (req,res,next) => {
    const token = req.cookies.jwt;
    if(token){
        jwt.verify(token, key , (err,decodedToken) => {
            if(err){
                console.log(err.message);
                res.redirect('/api/login');
            }
            else{
                // console.log("id: " + decodedToken.id + ",role: " + decodedToken.role);
                res.status(200).redirect('/api/paginationformHandlebar');
            }
        })
    }else{
        next();
    }
}

module.exports = { isLoggedIn };

