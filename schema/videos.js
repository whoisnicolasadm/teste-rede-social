const mg = require('mongoose')

const schema = new mg.Schema({
  id: { type: String, required: true, unique: true },
  videoOwnerId: { type: String, required: true },
  likes: { type: String, required: true },
  time: { type: String, required: true },
  thumbnail: { type: String, required: true },
  description: { type: String, required: false },
  ownerAvatar: { type: String, required: true },
  ownerUsername: { type: String, required: true },
  videoName: { type: String, required: true }
})

module.exports = mg.model("videos", schema)