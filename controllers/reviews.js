const Review = require('../models/review')
const Campground = require('../models/campground');

module.exports.createReview = async (req, res, next) => {
    //console.log("Got Review POST REQUEST!!!")
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review)
    review.author = req.user._id
    campground.reviews.push(review)
    await review.save();
    await campground.save();
    req.flash('success', 'New Review Added !!!')
    res.redirect(`/campgrounds/${req.params.id}`)
}

module.exports.deleteReview = async (req, res, next) => {
    const { id, reviewid } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewid } });
    await Review.findByIdAndDelete(reviewid);
    req.flash('error','Review Deleted !!!')
    res.redirect(`/campgrounds/${id}`)
}