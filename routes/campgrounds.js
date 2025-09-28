const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const { isLoggedIn, validateCampground, isCampgroundAuthor } = require('../middleware');

// キャンプ場一覧画面へのルートの定義
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', { campgrounds });
}));

// キャンプ場の新規登録画面へのルートの定義
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
});

// キャンプ場の新規登録処理のルートの定義
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    // 新しいキャンプ場を作成したときフラッシュを設定する
    req.flash('success', '新しいキャンプ場を登録しました');
    res.redirect(`/campgrounds/${campground._id}`);
}));

// キャンプ場の詳細画面へのルートの定義
router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    .populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    console.log(campground);
    // 存在しない or 削除済みのキャンプ場へアクセスしようとした際のエラー処理
    if (!campground) {
        req.flash('error', 'キャンプ場は見つかりませんでした');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}));

// キャンプ場の編集画面へのルートの定義
router.get('/:id/edit', isLoggedIn, isCampgroundAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    // 存在しない or 削除済みのキャンプ場へアクセスしようとした際のエラー処理
    if (!campground) {
        req.flash('error', 'キャンプ場は見つかりませんでした');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}));

// キャンプ場の編集処理のルートの定義
router.put('/:id', isLoggedIn, validateCampground, isCampgroundAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    // キャンプ場を更新したときのフラッシュを設定する
    req.flash('success', 'キャンプ場を更新しました');    
    res.redirect(`/campgrounds/${camp._id}`);
}));

// キャンプ場の削除処理のルートの定義
router.delete('/:id', isLoggedIn, isCampgroundAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    // キャンプ場を削除したときフのラッシュを設定する
    req.flash('success', 'キャンプ場を削除しました');  
    res.redirect(`/campgrounds`);
}));

module.exports = router;