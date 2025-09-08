// フレームワーク、標準モジュール、ライブラリ、自作ファイルのインポート
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

// Expressアプリのインスタンスの作成
const app = express();

// mongoDBへの接続
mongoose.connect('mongodb://localhost:27017/yelp-camp',
    { 
        useNewUrlParser: true,
        useUnifiedTopology: true, 
        useCreateIndex: true,
        useFindAndModify: false
     })
    .then(() => {
        console.log('MongoDBへの接続を確立しました');
    })
    .catch(err => {
        console.log('MongoDBへの接続ができませんでした: ');
        console.log(err);
    });

// テンプレートエンジンの設定
app.engine('ejs', ejsMate);

// テンプレートエンジン(ビューエンジン)にEJSを指定
app.set('view engine', 'ejs');
// テンプレートファイルの置き場所の指定
app.set('views', path.join(__dirname, 'views'));

// ミドルウェアの定義
// POSTのレスポンスを解析する方法の指定
app.use(express.urlencoded({extended: true}));
// HTMLフォームのPOSTとGET以外への対応
app.use(methodOverride('_method'));

// 静的ファイルの提供
app.use(express.static(path.join(__dirname, 'public')));

// ホームページへのルートの定義
app.get('/', (req,res) => {
    res.render('home');
});

// キャンプ場関係のルーティング定義を読み込む
app.use('/campgrounds', campgroundRoutes);

// レビュー関係のルーティング定義を読み込む
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.use((req, res, next) => {
    next(new ExpressError('ページが見つかりませんでした', 404));
});

// カスタムのエラーハンドラ
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) {
        err.message = '問題が発生しました';
    }
    res.status(statusCode).render('error', { err });
});

// サーバの起動
app.listen(3000, () => {
    console.log('ポート3000でリクエストを受付中・・・');
});
