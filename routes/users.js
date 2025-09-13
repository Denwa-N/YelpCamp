const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user');
const { storeReturnTo } = require('../middleware');

// ユーザ登録へのルートの定義
router.get('/register', (req, res) => {
    res.render('users/register');
});

// ユーザ登録処理のルートの定義
router.post('/register', async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) {
                return next(err);
            }
            req.flash('success', 'Yelp Camp へようこそ');
            res.redirect('/campgrounds')
        });
    }
    catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
});

// ログイン画面へのルートの定義
router.get('/login', (req, res) => {
    res.render('users/login');
});

// ログイン処理へのルートの定義
// ミドルウェアによる認証処理
router.post('/login', storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    // passport.authenticate内でreq.login()が実行されている
    req.flash('success', 'おかえりなさい');
    // ログイン前に操作していた画面にリダイレクトする
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
});

// ログアウト処理のルートの定義
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash('success', 'ログアウトしました');
        res.redirect('/campgrounds');
    });
});

module.exports = router;