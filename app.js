require('dotenv').config();

var express 		= require("express"),
	app 			= express(),
	bodyParser 		= require("body-parser"),
	mongoose 		= require("mongoose"),
	passport		= require("passport"),
	localStrategy 	= require("passport-local"),
	User 			= require("./models/user"),
	Campground		= require("./models/campground"),
	Comment			= require("./models/comment"),
	methodOverride	= require("method-override"),
	flash			= require("connect-flash"),
	seedDB			= require("./seeds")

//requiring routes
var commentRoutes 		= require("./routes/comments"),
	campgroundRoutes 	= require("./routes/campgrounds"),
	indexRoutes 		= require("./routes/index")

mongoose.connect("mongodb+srv://bishal:RaKtim@20521101@yelp-camp-cluster-hpiyp.mongodb.net/test?retryWrites=true&w=majority", 
				 {useUnifiedTopology: true, useNewUrlParser: true, 
				  useFindAndModify: false, useCreateIndex: true});


app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
//console.log(__dirname);
app.use(methodOverride("_method"));

app.use(bodyParser.urlencoded({extended: true}));
app.use(flash());

app.locals.moment = require("moment");

//seedDB(); //seed the database


// PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: "code a little run a little fix a little",
	resave: false,
	saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	// console.log("res.locals.currentUser is: ", res.locals);
	// console.log("req.user is: ", req.user);
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	return next();
});


app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);


app.listen(process.env.PORT || 3000, function(){
	console.log("The YelpCamp Server Has Started!");
});


//This will override the default Page Not Found error page
app.use(function(req, res) {
    res.status(404).end("Something went wrong! Please try again!");
});
