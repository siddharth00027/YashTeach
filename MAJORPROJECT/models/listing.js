const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js")//require models/review

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        type: String,
        // default:"https://images.pexels.com/photos/18540855/pexels-photo-18540855/free-photo-of-woman-on-a-beach-standing-and-holding-a-chair.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load"
        set: (v) => v === "" ? "https://images.pexels.com/photos/18540855/pexels-photo-18540855/free-photo-of-woman-on-a-beach-standing-and-holding-a-chair.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load" : v,
    },
    price: Number,
    location: String,
    country: String,
    reviews:[{
        type:Schema.Types.ObjectId,
        ref:"Review",
    }
],
});

// handle delete
listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
        await Review.deleteMany({_id:{$in:listing.reviews}});
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;

