const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//users collection schema in sample_restaurants database 
const userSchema = new Schema({
  username: String,
  password: String,
  role: String
}, { collection: "users" });

//exporting the Users model 
module.exports = mongoose.model('Users', userSchema);
