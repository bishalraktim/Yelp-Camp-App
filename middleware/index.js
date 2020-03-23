var middlewareObj = {};
var Campground = require("../models/campground");
var Comment = require("../models/comment");


middlewareObj.checkCampgroundOwnership = function(req, res, next){
	//check if user is logged in
	if(req.isAuthenticated()){
		//does user own the campground
		Campground.findById(req.params.id, function(err, foundCampground){
			if(err || !foundCampground){
				req.flash("error", "Campground not found!");
				res.redirect("back");
			}
			else{
				//does user own the campground
				
				//console.log(foundCampground.author.id); // is mongoose object
				//console.log(req.user._id); // is string
				
				if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
					next();
				}
				else{
					req.flash("error", "You don't have permission to do that!");
					res.redirect("back");
				}
			}
		});
	}
	else{
		req.flash("error", "You need to be logged in to do that!");
		res.redirect("back");
	}
}


middlewareObj.checkCommentOwnership = function(req, res, next){
	//check if user is logged in
	if(req.isAuthenticated()){
		//does user own the comment
		Comment.findById(req.params.comment_id, function(err, foundComment){
			if(err || !foundComment){
				req.flash("error", "Comment not found! Something went wrong!");
				res.redirect("back");
			}
			else{
				//does user own the comment
				//console.log("foundComment ====== ", foundComment);
				if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
					next();
				}
				else{
					req.flash("error", "You don't have permission to do that!");
					res.redirect("back");
				}
			}
		});
	}
	else{
		req.flash("error", "You need to be logged in to do that!");
		res.redirect("back");
	}
}


middlewareObj.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "You need to be logged in to do that!");
	res.redirect("/login");
}

//console.log("====The middlewareObj*****", middlewareObj);

module.exports = middlewareObj;
