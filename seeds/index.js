const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('../seeds/cities');
const { places, descriptors } = require('../seeds/seedHelpers');
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const randomnum = Math.floor(Math.random() * 1000);
        const newground = new Campground({
            author : "605f1cc368a3bd2bd0c10be2",
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[randomnum].city}, ${cities[randomnum].state}`,
            image: "https://source.unsplash.com/collection/483251",
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque soluta quibusdam illo ad dolorum! Cupiditate officiis beatae aperiam assumenda nulla voluptatum facilis itaque porro praesentium, eum ut, unde nemo illum!",
            price : Math.floor(Math.random() * 30)
        })
        await newground.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})