var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

var NodeGeocoder = require("node-geocoder");
 
var options = {
  provider: "google",
  httpAdapter: "https",
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);
//console.log("geocoder: ", geocoder);


var multer = require('multer');
var storage = multer.diskStorage({
	filename: function(req, file, callback) {
		callback(null, Date.now() + file.originalname);
	}
});
var imageFilter = function (req, file, cb) {
	// accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
		return cb(new Error('Only image files are allowed!'), false);
	}
	cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter});

var cloudinary = require('cloudinary');
cloudinary.config({
	cloud_name: 'bishal',
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET
});


//Index - show all campgrounds
router.get("/", function(req, res){	
	//eval(require("locus"));
	if(req.query.search){
		var regex = new RegExp(escapeRegex(req.query.search), 'gi');
		
		//get the searched campground by name
		Campground.find({name: regex}, function(err, allCampgrounds){
			if(err){
				console.log(err);
			}
			else{
				if(allCampgrounds.length < 1){
					res.render("campgrounds/index", {campgrounds: allCampgrounds, page: "campgrounds", noMatch: "No Campgrounds Match!"});
				}
				else{
					res.render("campgrounds/index", {campgrounds: allCampgrounds, page: "campgrounds"});
				}
			}
		});
	}
	else{
		//get all campgrounds from DB
		Campground.find({}, function(err, allCampgrounds){
			if(err){
				console.log(err);
			}
			else{
				res.render("campgrounds/index", {campgrounds: allCampgrounds, page: "campgrounds", noMatch: ""});
			}
		});
	}
});


//Create - create campgrounds
router.post("/", middleware.isLoggedIn, upload.single("imgUrl"), function(req, res){
	cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
		if(err){
			req.flash("error", err.message)
			return res.redirect("back");
		}
  		// add cloudinary url for the image to the campground object under image property
  		req.body.imgUrl = result.secure_url;
		req.body.imageId = result.public_id;
		
		var name = req.body.userName;
		var price = req.body.price;
		var image = req.body.imgUrl;
		var imageId = req.body.imageId;
		var desc = req.body.description;
		var author = { 
			id: req.user._id,
			username: req.user.username
		}
		
		geocoder.geocode(req.body.location, function (err, data) {
			if (err || !data.length) {
				req.flash('error', 'Invalid address');
				return res.redirect('back');
			}
			//console.log("data=====", data);
			var lat = data[0].latitude;
			var lng = data[0].longitude;
			var location = data[0].formattedAddress;
			
			var newCampground = {name: name, price: price, image: image, imageId: imageId, description: desc, 
								 author: author, location: location, lat: lat, lng: lng};
			//create a new campground and save to DB
			Campground.create(newCampground, function(err, newlyCreated){
				if(err){
					console.log(err);
				}
				else{
					//console.log(newlyCreated);
					//redirect back to campgrounds page
					res.redirect("/campgrounds");
				}
			});
		});
	});
});


//New - displays form to make a new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("campgrounds/new");
});


//SHOW - shows more info about one campground
router.get("/:id", function(req, res){
	//find the campground with the provided ID
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err || !foundCampground){
			req.flash("error", "Campground not found");
			res.redirect("back");
		}
		else{
			//console.log(foundCampground);
			
			//render show template with that campground 
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
});


//Edit Campground Route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		res.render("./campgrounds/edit", {campground: foundCampground});
	});
});


// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, upload.single("campground[image]"), function(req, res){
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			req.flash("error", err.message);
			res.redirect("back");
		}
		else{
			if(req.file){
				cloudinary.v2.uploader.destroy(campground.imageId, function(err){
					if(err){
						req.flash("error", err.message);
						return res.redirect("back");
					}
					cloudinary.v2.uploader.upload(req.file.path, function(err, result){
						
						//console.log("file path", req.file);
						
						req.body.campground.image = result.secure_url;
						req.body.campground.imageId = result.public_id;
						
						geocoder.geocode(req.body.location, function (err, data) {
							//console.log("req.body", req.body);
							if (err || !data.length) {
								req.flash('error', 'Invalid address');
								return res.redirect('back');
							}
							req.body.campground.lat = data[0].latitude;
							req.body.campground.lng = data[0].longitude;
							req.body.campground.location = data[0].formattedAddress;
							
							//console.log("Req.body.campground: ", req.body.campground);
							Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
								if(err){
									req.flash("error", err.message);
									res.redirect("back");
								} else {
									req.flash("success","Successfully Updated!");
									res.redirect("/campgrounds/" + req.params.id);
								}
							});
						});
					});
				});
			}
			else{
				geocoder.geocode(req.body.location, function (err, data) {
					//console.log("req.body", req.body);
					if (err || !data.length) {
						req.flash('error', 'Invalid address');
						return res.redirect('back');
					}
					req.body.campground.lat = data[0].latitude;
					req.body.campground.lng = data[0].longitude;
					req.body.campground.location = data[0].formattedAddress;
					
					Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
						if(err){
							req.flash("error", err.message);
							res.redirect("back");
						} else {
							req.flash("success","Successfully Updated!");
							res.redirect("/campgrounds/" + req.params.id);
						}
					});
				});
			}
		}
	});
});


//Destroy Campground Route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			res.redirect("/campgrounds");
		}
		else{
			cloudinary.v2.uploader.destroy(campground.imageId, function(err){
				if(err){
					req.flash("error", err.message);
					return res.redirect("back");
				}
				campground.remove();
				req.flash("success", "Campground deleted successfully!");
				res.redirect("/campgrounds");
			});
		}
	});
});


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports = router;
