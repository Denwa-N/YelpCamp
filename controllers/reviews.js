const Review = require('../models/review');
const Campground = require('../models/campground');

// レビュー投稿処理のルーティング処理
module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    // レビューを登録したときのフラッシュを設定する
    req.flash('success', 'レビューを登録しました');  
    res.redirect(`/campgrounds/${campground._id}`);
}

// レビュー削除処理のルーティング処理
module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    // レビューを削除したときのフラッシュを設定する
    req.flash('success', 'レビューを削除しました');  
    res.redirect(`/campgrounds/${id}`);
}