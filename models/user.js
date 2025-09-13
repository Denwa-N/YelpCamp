// npmライブラリのインポート
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const { Schema } = mongoose;

// スキーマ(DBに格納するデータの形)の定義
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

// userSchemaにpassport-local-mongooseの機能を適用する
// 認証に必要な機能を提供してくれる(username, hash, salt)
userSchema.plugin(passportLocalMongoose, {
    errormessages: {
        MissingPasswordError: 'パスワードを入力してください',
        AttemptTooSoonError: 'アカウントがロックされています。時間をあけて再度試してください',
        TooManyAttemptsError: 'ログインの失敗が続いたため、アカウントをロックしました。',
        NoSaltValueStoredError: '認証に失敗しました',
        IncorrectPasswordError: 'パスワードまたはユーザー名が間違っています',
        IncorrectUsernameError: 'パスワードまたはユーザー名が間違っています',
        MissingUsernameError: 'ユーザー名を入力してください',
        UserExistsError: 'そのユーザー名は既に使われています'
    }
});

// モデル(DBを操作するための道具)の定義
module.exports = mongoose.model('User', userSchema);