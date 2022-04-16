const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var Restaurants = "";
const restaurantSchema = new Schema({
    address: {
        building: String,
        coord: [Number],
        street: String,
        zipcode: String
    },
    borough: String,
    cuisine: String,
    grades: [{
        date: Date,
        grade: String,
        score: Number
    }],
    name: String,
    restaurant_id: String
}, { collection: "restaurants" });

class RestaurantDBClass {

    initialize(connectionString) {
        mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
        Restaurants = mongoose.model('Restaurants', restaurantSchema);
        return true;
    }

    async addNewRestaurant(data) {
        let createNewRestaurant = new Restaurants(data);
        await createNewRestaurant.save();
        return "new restaurant with id :" + createNewRestaurant._id + " successfully added";
    }

    getAllRestaurants(page, perPage, borough) {
        let filterForBorough = borough ? { borough } : {};
        return Restaurants.find(filterForBorough).sort({ restaurant_id: +1 }).skip((page - 1) * perPage).limit(perPage).exec();
    }

    getRestaurantById(id) {
        return Restaurants.findOne({ _id: id }).exec();
    }

    async updateRestaurantById(data, id) {
        await Restaurants.updateOne({ _id: id }, { $set: data }).exec();
        return "restaurant with given id : " + id + " successfully updated";
    }

    async deleteRestaurantById(id) {
        await Restaurants.deleteOne({ _id: id }).exec();
        return "restaurant with given id : " + id + "successfully deleted";
    }
}

// module.exports = mongoose.model('Restaurants', restaurantSchema);
module.exports = RestaurantDBClass;