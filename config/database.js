require('dotenv').config()

var user = process.env.USER_NAME;
var password = process.env.PASSWORD;
var database = process.env.DATABASE;
// console.log(user + " " + password + " " + database);
module.exports = {
    // url: "mongodb+srv://" + user + ":" + password + "@cluster0.m71el.mongodb.net/" + database + "?retryWrites=true&w=majority"
    url: "mongodb+srv://" + user + ":" + password + "@cluster0.ona7y.mongodb.net/" + database + "?retryWrites=true&w=majority"
};
