// 開発モードの場合は.envを読み込む
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

console.log(process.env.SECRET);
console.log(process.env.API_KEY);

// フレームワーク、標準モジュール、ライブラリのインポート
const express = require('express');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const path = require('path');
const passport = require('passport');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
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

// session情報をmongoDBに保持
const MongoStore = require('connect-mongo');

// mongoDBへの接続
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl,
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

const store = MongoStore.create({
    mongoUrl: dbUrl,
    // cryptオプションはconnect-mongo v4では使えない
    // crypto: {
    //     secret: 'mysecret'
    // },
    touchAfter: 24 * 3600 // time period in seconds
});

store.on('error', e => {
    console.log('セッションストアエラー', e);
});

// セッションの設定
const secret = process.env.SECRET || 'mysecret';
const sessionConfig = {
    store,
    name: 'session',
    secret: secret,
    resave: 'false',
    saveUninitialized: true,
    cookie: {
        HttpOnly: true,
        // secure: true, // https通信のみでcookieを保持する
        maxAge: 1000 * 60 * 60 * 24 * 7 // 有効期限
    }
}
app.use(session(sessionConfig));

// フラッシュの設定
app.use(flash());

// パスポートの設定
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ローカルズの設定
app.use((req, res, next) => {
    // ログインユーザーの情報
    res.locals.currentUser = req.user;
    // 成功時のフラッシュ
    res.locals.success = req.flash('success');
    // 失敗時のフラッシュ
    res.locals.error = req.flash('error');
    next();
});

// MongoDBインジェクション対策
app.use(mongoSanitize());

// helmetによるセキュリティミドルウェアの有効化
app.use(helmet());
// helmetのcontentSecurityPolicyの設定
const scriptSrcUrls = [
    'https://cdn.maptiler.com',
    'https://cdn.jsdelivr.net'
];
const styleSrcUrls = [
    'https://cdn.maptiler.com',
    'https://cdn.jsdelivr.net'
];
const connectSrcUrls = [
    'https://api.maptiler.com',
    'https://*.tiles.mapbox.com',
    'https://events.mapbox.com'
];
const fontSrcUrls = [];
const imgSrcUrls = [
    `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`,
    'https://images.unsplash.com'
];
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: [],
        connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        childSrc: ["blob:"],
        objectSrc: [],
        imgSrc: ["'self'", 'blob:', 'data:', ...imgSrcUrls],
        fontSrc: ["'self'", ...fontSrcUrls]
    }
}));

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
