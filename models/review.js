// npmライブラリのインポート
const { ref } = require('joi');
const mongoose = require('mongoose');

const { Schema } = mongoose;

// スキーマ(DBに格納するデータの形)の定義
const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

// モデル(DBを操作するための道具)の定義
module.exports = mongoose.model('Review', reviewSchema);