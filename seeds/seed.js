const Campground = require('../models/campground');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers')
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/yelp-camp',
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => {
        console.log('MongoDBへの接続を確立しました');
    })
    .catch(err => {
        console.log('MongoDBへの接続ができませんでした: ');
        console.log(err);
    });

// ランダムなDBデータの作成
const sample = array => array[Math.floor(Math.random() * array.length)];
const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i = 0; i < 50; i++) {
        const randomCityIndex = Math.floor(Math.random() * cities.length);
        const price = Math.floor(Math.random() * 2000) + 2000;
        const camp = new Campground({
            author: '68d0bbea0ce33c57efe474a2',
            location: `${cities[randomCityIndex].prefecture}${cities[randomCityIndex].city}`,
            title: `${sample(descriptors)}・${sample(places)}`,
            description: '湖畔に広がる自然豊かなキャンプ場です。四季折々の風景を楽しみながら、テント泊やバーベキューを満喫できます。清流での水遊びや星空観察も人気で、家族連れからソロキャンパーまで幅広く利用されています。施設内には炊事場やシャワーも完備され、快適にアウトドアを楽しめます。',
            price,
            images: [
                {
                url: 'https://res.cloudinary.com/do9xvc9wi/image/upload/v1764480065/YelpCamp/d9ig7nxulxurfyethprf.jpg',
                filename: 'YelpCamp/d9ig7nxulxurfyethprf'
                },
                {
                url: 'https://res.cloudinary.com/do9xvc9wi/image/upload/v1764480066/YelpCamp/wcospk4x7edhdpncsnux.jpg',
                filename: 'YelpCamp/wcospk4x7edhdpncsnux'
                }
            ]
        });
        await camp.save();
    }
}

seedDB().then(() => {
    // 実行後、コネクションの切断
    mongoose.connection.close();
});