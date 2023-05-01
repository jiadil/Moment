const express = require("express");
const router = express.Router({ mergeParams: true });

const reviews = require("../conrtollers/reviews");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");

//error
const wrapAsync = require("../Error/catchError");

//new review
router.post("/", isLoggedIn, validateReview, wrapAsync(reviews.createReview));

//delete review
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviews.deleteReview));

module.exports = router;