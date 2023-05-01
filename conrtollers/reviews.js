const campground = require("../models/campground"); //access data
const review = require("../models/review");

module.exports.createReview = async (req, res) => {
    const cgreview = await campground.findById(req.params.id);
    const reviewpost = new review(req.body.review);
    reviewpost.author = req.user._id;
    cgreview.reviews.push(reviewpost);
    await reviewpost.save();
    await cgreview.save();
    req.flash("success", "successfully made a new review!");
    res.redirect(`/moment/${cgreview.id}`);
};

module.exports.deleteReview = async (req, res, next) => {
    const { id, reviewId } = req.params;
    await campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await review.findByIdAndDelete(reviewId);
    req.flash("success", "successfully delete a review!");
    res.redirect(`/moment/${id}`);
};