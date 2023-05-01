const campground = require("../models/campground");
const { cloudinary } = require("../cloudinary/index");
//map
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

//show all
module.exports.all = async (req, res) => {
    const campgrounds = await campground.find({});
    res.render("all", { campgrounds })
}

//new
module.exports.renderNewForm = (req, res) => {
    res.render("new");
}
module.exports.createNewForm = (async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const cgnew = new campground(req.body.campground);
    cgnew.geometry = geoData.body.features[0].geometry;
    cgnew.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    cgnew.author = req.user._id;
    await cgnew.save();
    req.flash("success", "successfully made a new camground!");
    res.redirect(`/moment/${cgnew._id}`);
});

//show
module.exports.showCampground = (async (req, res, next) => {
    const cgplace = await campground.findById(req.params.id).populate({
        path: "reviews",
        populate: {
            path: "author" //list all reviews from different author
        }
    }).populate("author");
    console.log("showwwwwwwwwwwwwwww");
    console.log(cgplace);
    if (!cgplace) {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/moment");
    }
    res.render("show", { cgplace });
});


//edit
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const cgedit = await campground.findById(id);
    if (!cgedit) {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/moment");
    }
    res.render("edit", { cgedit });
};
module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const cgedit = await campground.findByIdAndUpdate(id, { ...req.body.campground });//split the info
    //new image
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    cgedit.images.push(...imgs);
    await cgedit.save();
    //delete image
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await cgedit.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash("success", "successfully update a new camground!");
    res.redirect(`/moment/${cgedit._id}`);
};

//delete
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await campground.findByIdAndDelete(id);
    req.flash("success", "successfully delete a camground!");
    res.redirect("/moment");
};