// フレームワーク、標準モジュール、ライブラリのインポート
const express = require('express');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const path = require('path');
const passport = require('passport');
const LocalStrategy = require('passport-local');

// 自作ファイルの読込
const ExpressError = require('./utils/ExpressError');

// ルーターの読込
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

// モデルの読込
const User = require('./models/user');

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

// セッションの設定
const sessionConfig = {
    secret: 'mysecret',
    resave: 'false',
    saveUninitialized: true,
    cookie: {
        HttpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7 // 有効期限
    }
}
app.use(session(sessionConfig));

// フラッシュの設定
app.use(flash());
app.use((req, res, next) => {
    // 成功時のフラッシュ
    res.locals.success = req.flash('success');
    // 失敗時のフラッシュ
    res.locals.error = req.flash('error');
    next();
})

// パスポートの設定
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ホームページへのルートの定義
app.get('/', (req,res) => {
    res.render('home');
});

app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: 'hogegege@example.com', username: 'hogegege' });
    const newUser = await User.register(user, 'mogegege');
    res.send(newUser);
})

// キャンプ場関係のルーティング定義を読み込む
app.use('/campgrounds', campgroundRoutes);

// レビュー関係のルーティング定義を読み込む
app.use('/campgrounds/:id/reviews', reviewRoutes);

// ユーザー関係のルーティング定義を読み込む
app.use('/', userRoutes);

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
