const { campgroundSchema, reviewSchema } = require("./Error/Schemas");
const AppError = require("./Error/AppError");
const campground = require("./models/campground"); //access data
const review = require("./models/review");

//review
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new AppError(400, msg);
    }
    else {
        next();
    }
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const reviewedit = await review.findById(reviewId);
    if (!reviewedit.author.equals(req.user._id)) {
        req.flash("error", "You do not have the permission to do that!");
        return res.redirect(`/moment/${id}`);
    }
    next();
}

//campground
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new AppError(400, msg);
    }
    else {
        next();
    }
}

module.exports.isLoggedIn = (req, res, next) => {
    console.log("req.user....................................", req.user);
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}


//if current user = published user
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const cgedit = await campground.findById(id);
    if (!cgedit.author.equals(req.user._id)) {
        req.flash("error", "You do not have the permission to do that!");
        return res.redirect(`/moment/${id}`);
    }
    next();
}


