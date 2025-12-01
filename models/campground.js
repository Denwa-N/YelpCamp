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

// バーチャルをJSON.stringifyで使用するためオプションをスキーマに渡す必要がある
const opts = { toJSON: { virtuals: true } };

// スキーマ(DBに格納するデータの形)の定義
const campgroundSchema = new Schema({
    title: String,
    images: [imageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
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
}, opts);

// campgroundスキーマにバーチャルを追加する
campgroundSchema.virtual('properties.popupMarkup').get(function () {
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>`
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