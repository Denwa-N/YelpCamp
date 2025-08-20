// npmライブラリのインポート
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// スキーマ(DBに格納するデータの形)の定義
const campgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String
});

// モデル(DBを操作するための道具)の定義
module.exports = mongoose.model('Campground', campgroundSchema);