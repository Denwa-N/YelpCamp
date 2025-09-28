const express = require('express');
// ルーターにパラメータを渡すためにはmergeParamsが必要
const router = express.Router({ mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const Review = require('../models/review');
const Campground = require('../models/campground');
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware');

// レビュー投稿処理のルート定義
router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    // レビューを登録したときのフラッシュを設定する
    req.flash('success', 'レビューを登録しました');  
    res.redirect(`/campgrounds/${campground._id}`);
}));

// レビュー削除処理のルート定義
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    // レビューを削除したときのフラッシュを設定する
    req.flash('success', 'レビューを削除しました');  
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;