// npmライブラリのインポート
const mongoose = require('mongoose');

const { Schema } = mongoose;

// スキーマ(DBに格納するデータの形)の定義
const reviewSchema = new Schema({
    body: String,
    rating: Number,
});

// モデル(DBを操作するための道具)の定義
module.exports = mongoose.model('Review', reviewSchema);