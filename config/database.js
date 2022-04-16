require('dotenv').config()

var user = process.env.USER_NAME;
var password = process.env.PASSWORD;
var database = process.env.DATABASE;
// console.log(user + " " + password + " " + database);
module.exports = {
    //     url: "mongodb+srv://yashmehta:yash1234@cluster0.m71el.mongodb.net/sample_restaurants?retryWrites=true&w=majority"
    // url: "mongodb+srv://" + user + ":" + password + "@cluster0.m71el.mongodb.net/" + database + "?retryWrites=true&w=majority"
    url: "mongodb+srv://" + user + ":" + password + "@cluster0.ona7y.mongodb.net/" + database + "?retryWrites=true&w=majority"
};