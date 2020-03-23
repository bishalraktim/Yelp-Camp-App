var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");

var seeds = [
	{
		name: "Cloud's Rest", 
		price: 10.25,
		username: "Bishal",
		location: "Moonee Ponds Victoria 3039",
		lat: -37.766529, 
		lng: 144.919491,
		createdAt: "10 Jan 2020",
		author: {username: "David"},
		image: "https://d38b8me95wjkbc.cloudfront.net/uploads/blog/cover_image/71/1978201.jpg", 
		description: "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a 	piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance."
	},
	{
		name: "The Long Journey", 
		price: 10.50,
		username: "Raktim",
		location: "Moonee Ponds Victoria 3039",
		lat: -37.766529, 
		lng: 144.919491,
		createdAt: "10 Jan 2020",
		author: {username: "BR"},
		image: "https://secure.i.telegraph.co.uk/multimedia/archive/02969/camping-england_2969584b.jpg", 
		description: "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance."
	},
	{
		name: "Desert Mesa", 
		price: 9.55,
		username: "BR",
		location: "Moonee Ponds Victoria 3039",
		lat: -37.766529, 
		lng: 144.919491,
		createdAt: "10 Jan 2020",
		author: {username: "Simon"},
		image: "https://media-cdn.tripadvisor.com/media/photo-s/12/4e/18/cb/numinbah-valley-adventure.jpg", 
		description: "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance."
	},	
	{
		name: "Cylinder Beach", 
		price: 7.55,
		username: "Raktim",
		location: "Moonee Ponds Victoria 3039",
		lat: -37.766529, 
		lng: 144.919491,
		createdAt: "17 March 2020",
		author: {username: "Robert"},
		image: "https://media-cdn.tripadvisor.com/media/photo-s/05/0f/1d/d8/straddie-camping.jpg", 
		description: "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance."
	}
]


async function seedDB(){
	try{
		await Campground.deleteMany({});
		console.log("campgrounds removed!");
		await Comment.deleteMany({});
		console.log("comments removed!");
		
		for(const seed of seeds){
			let campground = await Campground.create(seed);
			console.log("campground created!");
			let comment = await Comment.create({
				text: "It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old",
				author: {username: "Homer"}
			});
			console.log("comment created!");
			campground.comments.push(comment);
			campground.save();
			console.log("comment added to campground!");
		}
	}
	catch(err){
		console.log(err);
	}
}

module.exports = seedDB;
