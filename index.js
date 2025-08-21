// フレームワーク、標準モジュール、ライブラリ、自作ファイルのインポート
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');

// Expressアプリのインスタンスの作成
const app = express();

// mongoDBへの接続
mongoose.connect('mongodb://localhost:27017/yelp-camp',
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
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

// ホームページへのルートの定義
app.get('/', (req,res) => {
    res.render('home');
});

// 一覧画面へのルートの定義
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', { campgrounds });
}));

// 新規登録画面へのルートの定義
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

// 新規登録処理のルートの定義
app.post('/campgrounds', catchAsync(async (req, res) => {
    // 画面外から不正データが登録できないように制御する
    if (!req.body.campground) throw new ExpressError('不正なキャンプ場のデータです', 400);

    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

// 詳細画面へのルートの定義
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { campground });
}));

// 編集画面へのルートの定義
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}));

// 編集処理のルートの定義
app.put('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`);
}));

// 削除処理のルートの定義
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect(`/campgrounds`);
}));

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
