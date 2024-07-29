// BASIC SET UP
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js")//require models/listings
const Review = require("./models/review.js")//require models/review

const path = require("path");
const ejsMate = require("ejs-mate");

app.use(express.urlencoded({ extended: true }));
const methodOverride = require('method-override')

app.use(methodOverride('_method'));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);//set engine as ejs-Mate 

app.use(express.static(path.join(__dirname, "/public")));//to use static file

// require wrapasync
const wrapAsync = require("./utils/wrapAsync.js");


// require ExpressError
const ExpressError = require("./utils/ExpressError.js");

// require server side schema
const { listingSchema, reviewSchema } = require("./schema.js");

// CONNECT TO DATABASE
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    await mongoose.connect(MONGO_URL);
}

main()
    .then(() => {
        console.log("connected DB");
    })
    .catch((err) => {
        console.log(err);
    })


// CREATE A API 
app.get("/", (req, res) => {
    res.send("HI,I am a root");
})
app.post("/api/addbook")
// validate listing

const validateListing = (req, res, next) => {
    // let result = listingSchema.validate(req.body);
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};
// validate review
const validateReview = (req, res, next) => {
    // let result = listingSchema.validate(req.body);
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

// Index Route
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", { allListings });
})
);

//  New Route
app.get("/listings/new", (req, res) => {
    res.render("./listings/new.ejs")
})


// show route
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    //  console.log(allListings);
    res.render("./listings/show.ejs", { listing });
})
);

// CREATE ROUTE
// using wrapasync
app.post("/listings", validateListing, wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
})
);


// using try catch
// app.post("/listings", async (req, res,next) => {
//     try {
//         const newListing=new Listing(req.body.listing);
//         await newListing.save();
//         res.redirect("/listings");

//     } catch (error) {
//         console.log("error has been occured!")
//         next(error);//call to error handler
//     }
// });

// edit route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    //  console.log(allListings);
    res.render("./listings/edit.ejs", { listing });
})
);

// Update Route
app.put("/listings/:id", validateListing,
    wrapAsync(async (req, res) => {
        let { id } = req.params;
        await Listing.findByIdAndUpdate(id, { ...req.body.listing });
        res.redirect(`/listings/${id}`);
    })
);

// DELETE ROUTE
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findByIdAndDelete(id);
    console.log("DELTED SUCCESSFULLY!!");
    res.redirect("/listings");
})
);

// Reviews
// post route of review
app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newreview = new Review(req.body.review);
    console.log(listing.title);
    console.log(req.body.review.rating);
    console.log(req.body.review.Comment);
    listing.reviews.push(newreview);
    await newreview.save();
    await listing.save();
    console.log("new review saved");
   
    res.redirect(`/listings/${listing.id}`);
    //res.send("new review saved");
}));

// delete route for review
app.delete("/listings/:id/reviews/:reviewId",
    wrapAsync(async (req, res) => {
        let { id, reviewId } = req.params;
        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });//remove review from reviews array whose id=reviewId
        await Review.findByIdAndDelete(reviewId);
        res.redirect(`/listings/${id}`);
     
    }))


// to send error to error handeler when there is no such route or page exist
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found!"));
});

// error handler
app.use((err, req, res, next) => {
    //  let { statusCode, message} = err;
    let { statusCode = 500, message = "something went wrong" } = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("./listings/error.ejs", { err });
});

// create and react to port 8080
app.listen(8080, () => {
    console.log("server is listening to port 8080");
});





















// testListing route
// app.get("/testListing", async (req, res) => {
//     // res.send("HI,I test listing");
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "By the beach",
//         price: 1200,
//         location: "calangute,Goa",
//         country: "India",
//     })
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("succesful testing!")
// });

// if(!req.body.listing.description){
//     throw new ExpressError(400,"Description is missing!");
// }
// if(!req.body.listing.title){
//     throw new ExpressError(400,"title is missing!");
// }
// if(!req.body.listing.price){
//     throw new ExpressError(400,"price is missing!");
// }
// if(!req.body.listing.location){
//     throw new ExpressError(400,"location is missing!");
// }
// if(!req.body.listing.country){
//     throw new ExpressError(400,"country is missing!");
// }