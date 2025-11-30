// npmライブラリのインポート
const mongoose = require('mongoose');

// reviewのインポート
const Review = require('./review');

const { Schema } = mongoose;

// imageプロパティをスキーマとして取り出しバーチャルを追加する
const imageSchema = new Schema({
    url: String,
    filename: String
});
imageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
});

// スキーマ(DBに格納するデータの形)の定義
const campgroundSchema = new Schema({
    title: String,
    images: [imageSchema],
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

campgroundSchema.post('findOneAndDelete', async function(campground) {
    if (campground) {
        await Review.deleteMany({
            _id: {
                $in: campground.reviews
            }
        });
    }
});

// モデル(DBを操作するための道具)の定義
module.exports = mongoose.model('Campground', campgroundSchema);