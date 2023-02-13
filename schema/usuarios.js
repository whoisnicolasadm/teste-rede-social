const mg = require('mongoose')

const schema = new mg.Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, required: false, default: "../public/images/userDefault.png" },
  verified: { type: Boolean, required: false },
  age: { type: Number, required: false },
  Twofauth: { type: Boolean, required: false },
  posts: { type: Number, required: true, default: 0 },
  phoneNumber: { type: String, required: true, default: "none" },
  following: { type: Number, required: true, default: 0 },
  followers: { type: Number, required: true, default: 0 },
})

module.exports = mg.model("usuario", schema)