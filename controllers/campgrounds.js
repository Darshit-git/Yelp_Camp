const Campground = require('../models/campground');

module.exports.index = async (req, res, next) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}

module.exports.createCampground = async (req, res, next) => {
    //if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id
    await campground.save()
    req.flash('success', 'New Campground Created Successfully!')
    res.redirect(`campgrounds/${campground._id}`)
}

module.exports.showCampground =  async (req, res, next) => {
    const campground = await Campground.findById(req.params.id)
    .populate({
       path: 'reviews',
       populate : {
           path : 'author'
       }
    }).populate('author');
    //console.log(campground);
    if(!campground){
        req.flash('error',`Campground Dosn't exist!`)
       return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground, msg : req.flash('success') })
    //res.send('Good')
}

module.exports.renderEditForm = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    if(!campground){
        req.flash('error',`Campground Dosn't exist!`)
       return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
}

module.exports.updateCampground = async (req, res, next) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    //console.log(campground.author)
    if(!campground){
        req.flash('error','Campground Does not Exist!')
        return res.redirect(`/campgrounds`)
    }
    await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    req.flash('success', 'Successfully Updated the Campground!')
    res.redirect(`/campgrounds/${id}`)
}

module.exports.deleteCampground = async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id)
    req.flash('success','Successfully Deleted Campground !!!')
    res.redirect("/campgrounds")
}