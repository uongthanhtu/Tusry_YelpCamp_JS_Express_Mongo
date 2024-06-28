const mongoose = require("mongoose");
const Campground = require("../models/campground");
const axios = require("axios");
const cities = require("./city");
const { createClient } = require("pexels");
const { descriptors, places } = require("./seedHelper");

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const client = createClient(
  "zf7yJnjMku2jgy9oSVyf89NPBqZpvuFPkB74sAVzUcS762S9uJIUgULG"
);
const query = "camping";

const pexelsPhotos = async function () {
  try {
    const data = await client.photos.search({ page: 1, query, per_page: 50 });
    const pexelPhotoCollection = data.photos.map((photo) => {
      return {
        link: `${photo.src.original}`,
        description: `${photo.alt}`,
      };
    });

    return pexelPhotoCollection;
  } catch (err) {
    console.error(err);
  }
};

const seedDB = async () => {
  let pexelPhotoArray = [];
  pexelPhotoArray = await pexelsPhotos();
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const priceRandom = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      image: pexelPhotoArray[i].link,
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      price: priceRandom,
      description: pexelPhotoArray[i].description,
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
