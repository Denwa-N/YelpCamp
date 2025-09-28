const Campground = require('../models/campground');

// キャンプ場一覧画面へのルーティング処理
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', { campgrounds });
}

// キャンプ場の新規登録画面へのルーティング処理
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

// キャンプ場の新規登録処理のルーティング処理
module.exports.createCampground = async (req, res) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    // 新しいキャンプ場を作成したときフラッシュを設定する
    req.flash('success', '新しいキャンプ場を登録しました');
    res.redirect(`/campgrounds/${campground._id}`);
}

// キャンプ場の詳細画面へのルーティング処理
module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    .populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    // 存在しない or 削除済みのキャンプ場へアクセスしようとした際のエラー処理
    if (!campground) {
        req.flash('error', 'キャンプ場は見つかりませんでした');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}

// キャンプ場の編集画面へのルーティング処理
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    // 存在しない or 削除済みのキャンプ場へアクセスしようとした際のエラー処理
    if (!campground) {
        req.flash('error', 'キャンプ場は見つかりませんでした');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

// キャンプ場の編集処理のルーティング処理
module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    // キャンプ場を更新したときのフラッシュを設定する
    req.flash('success', 'キャンプ場を更新しました');    
    res.redirect(`/campgrounds/${camp._id}`);
}

// キャンプ場の削除処理のルーティング処理
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    // キャンプ場を削除したときフのラッシュを設定する
    req.flash('success', 'キャンプ場を削除しました');  
    res.redirect(`/campgrounds`);
}