var express = require('express');
const mongoose = require("mongoose");
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var jwt = require('jsonwebtoken');
const exphbs = require("express-handlebars");
const { check, body, validationResult } = require('express-validator');
var database = require('./config/database');
var path = require('path');
var port = process.env.PORT || 8000;
app.use(bodyParser.urlencoded({ 'extended': 'true' })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')))
const RestaurantDBClass = require('./models/restaurants');
const { ObjectID } = require('bson');
const { query } = require('express');
const Users = require('./models/users');
const bcrypt = require('bcrypt');
var key = process.env.SECRET_KEY;
const {authAdmin} = require('./middleware/authorization');
const {authUser} = require('./middleware/authorization');
const {isLoggedIn} = require('./middleware/authentication');

var db = new RestaurantDBClass();
app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: 'main'
}));
app.set("view engine", ".hbs");

//initializing connection and initializing
var isConnected = db.initialize(database.url);
if (isConnected) {
    console.log("Successfully connected.");
    app.listen(port);
    console.log("App listening on port : " + port);
} else {
    connsol.log("Error in intialzing connection");
}

/****Authentication, Authorization and protecting routes****/

//if user is not logged in redirect user to login page
app.get("/api/login",isLoggedIn, function(req, res) {
    res.render("pages/login", { title: 'Login Page' });
});

//authenticate user
app.post("/api/login",isLoggedIn, function(req,res){

    var username = req.body.username;
    var password = req.body.password;

    Users.findOne({ username : username })
    .lean()
    .then((userData,err) => {
        if (err){
            console.log(err);
        }else{
            if(userData == null){
                res.status(400).send("Username not found!");
            }else{
                const username = userData.username;
                const pwd = userData.password;
                const id = userData._id;
                const role = userData.role;
                
                //authenticate user by verifying encrypted password using bcrypt 
                bcrypt.compare(password,pwd).then((checkPassword)=>{
                    if(checkPassword){
                        // console.log("Secret_key: " + key);

                        //generate token using id, role and secret key
                        const token = jwt.sign({ id,role } , key);

                        // console.log("JWT: " + token);
                        res.cookie('jwt',token,{httpOnly:true});

                        res.status(200).redirect('/api/paginationformHandlebar');
                    }else{
                        res.status(400).send("Password is incorrect, please enter valid password!");
                    }
                });
            }
        }
    });
})

//logout user and unset cookie 
app.get("/api/logout", function(req, res) {
    res.cookie('jwt','',{maxAge:1});
    res.redirect('/api/login');
});


/**End of section**/

app.get("/",function(req,res){
    res.redirect('/api/login');
});

// insert restaurant 
app.post('/api/restaurants',authAdmin, function(req, res) {
    var ioid = JSON.parse(req.body.id);
    var data = {
        _id: ObjectID(ioid),
        address: {
            building: req.body.building,
            coord: [req.body.xcoord, req.body.ycoord],
            street: req.body.street,
            zipcode: req.body.zipcode
        },
        borough: req.body.borough,
        cuisine: req.body.cuisine,
        grades: [{
            date: req.body.date,
            grade: req.body.grade,
            score: req.body.score
        }],
        name: req.body.name,
        restaurant_id: req.body.restaurant_id
    }
    db.addNewRestaurant(data).then(function(resData) {
        if (resData) {
            console.log(resData);
            res.status(201).send("Successfully added new restaurant with id : " + data._id + " in collection.");
        } else {
            res.status(500).send("There is an error in adding the new restaurant in collection");
        }
    });
});


//display data as per the requested pagination
app.get('/api/restaurants',authUser, [
    check('page').isInt({ min: 1 }).exists().withMessage('Enter value greater then zero.'),
    check('perPage').isInt({ min: 1 }).exists().withMessage('Enter value greater then zero.')
], function(req, res) {
    const validateErrors = validationResult(req);
    if (!validateErrors.isEmpty()) {

        return res.status(400).send("<h1>Please enter Valid page or perPage value</h1>");
    }
    let page = req.query.page;
    let perPage = req.query.perPage;
    let borough = req.query.borough;
    db.getAllRestaurants(page, perPage, borough).then(function(resData) {
        if (resData) {
            res.status(201).send(resData);
        } else {
            res.status(400).send("Details are not found as per the pagination request.");
        }
    });
});

//route to display form using handlebar
app.get("/api/paginationformHandlebar", authUser, function(req, res) {
    res.render("pages/paginationDisplay", { title: 'Display Pagination using Handlebar' });
});


app.post('/api/paginationformHandlebar', authUser, [
    check('page', "Please enter valid page number").isInt({ min: 1 }).exists(),
    check('perPage', "Please enter valid per page value").isInt({ min: 1 }).exists()
], (req, res, next) => {
    const validateErrors = validationResult(req);

    if (!validateErrors.isEmpty()) {
        const errorAlert = validateErrors.array();
        // console.log(errorAlert);
        return res.status(400).render("paginationDisplay", { errorMessage: errorAlert });
    }
    let page = req.body.page;
    let perPage = req.body.perPage;
    let borough = req.body.borough;

    db.getAllRestaurants(page, perPage, borough).then(function(resData) {
        console.log(resData);
        if (resData) {
            const JsonResData = {
                restaurants: resData.map(data => {
                    return {
                        id: data._id,
                        building: data.address.building,
                        street: data.address.street,
                        zipcode: data.address.zipcode,
                        borough: data.borough,
                        cuisine: data.cuisine,
                        grades: data.grades,
                        name: data.name,
                        restaurant_id: data.restaurant_id
                    }
                })
            }
            console.log(JsonResData.restaurants);
            res.render("pages/displayData", { data: JsonResData.restaurants });
        } else {
            res.status(400).send("Details are not found as per the pagination request.")
        }

    });
});
//get a restaurant with  specific id
app.get('/api/restaurants/:id',authUser, function(req, res) {
    let uid = req.params.id;
    db.getRestaurantById(uid).then(function(resData) {
        if (resData) {
            res.status(200).send(resData);
        } else {
            res.status(500).send("Given id is not valid, please check it again.")
        }
    });
});

// update restaurant cuisine type 
app.put('/api/restaurants/:id',authAdmin, function(req, res) {

    let uid = req.params.id;
    var data = {
        cuisine: req.body.cuisine
    }

    db.updateRestaurantById(data, uid).then(function(resData) {
        if (resData) {
            console.log(resData);
        } else {
            res.status(400).send("Cannot find the restaurant record to update.");
        }
    });
    res.status(200).send(data.cuisine + " Cuisine is successfully updated in collection.");
});

// delete a restaurant by id 
app.delete('/api/restaurants/:id',authAdmin, function(req, res) {
    let uid = req.params.id;
    db.deleteRestaurantById(uid).then(function(resData) {
        if (resData) {
            console.log(resData);
        } else {
            res.status(400).send("Cannot delete the record.");
        }
    });
    res.status(200).send('Restaurant with requested id : ' + uid + ' has been deleted.');
});

app.get('*',function(req,res){
    res.render('partials/error',{message:'Error:404 Page not found'})
});