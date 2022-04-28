const mongoose = require('mongoose');

const MusicSchema = mongoose.Schema({
    Songname: String,
    Film: String ,
    Music_director: String,
    singer: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Music', MusicSchema);