const express = require("express");
const router = express.Router();
const multer = require("multer");

const campgrounds = require("../conrtollers/campgrounds");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware"); //log in
const wrapAsync = require("../Error/catchError");

//save file
const { storage } = require("../cloudinary/index");
const upload = multer({ storage });

//all campgrounds
router.get("/", wrapAsync(campgrounds.all));

//new
router.get("/new", isLoggedIn, campgrounds.renderNewForm);
router.post("/", isLoggedIn, upload.array("image"), validateCampground, wrapAsync(campgrounds.createNewForm));

//show each campground
router.get("/:id", wrapAsync(campgrounds.showCampground));

//edit
router.get("/:id/edit", isLoggedIn, isAuthor, campgrounds.renderEditForm);
router.put("/:id", isLoggedIn, isAuthor, upload.array("image"), validateCampground, wrapAsync(campgrounds.updateCampground));

//delete
router.delete("/:id", isLoggedIn, isAuthor, wrapAsync(campgrounds.deleteCampground));

// router.route('/')
//     .get(catchAsync(campgrounds.index))
//     .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground))

// router.get('/new', isLoggedIn, campgrounds.renderNewForm)

// router.route('/:id')
//     .get(catchAsync(campgrounds.showCampground))
//     .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
//     .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

// router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))


module.exports = router;