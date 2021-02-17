var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  id: {type:Number , required: true},
  name: {type:String , required: true},
  surname: {type:String , required: true},
  nick:{type:String, required:true},
  password:{type:String, required:true},
  region:{type:String, required:true},
  area:{type:String, required:false},
  role:{type:String, required:true},
  phone:{type:String, required:true},
  mail:{type:String, required:true},
  active:{type:Boolean, required:true},
});

module.exports = mongoose.model('UserMdb', userSchema);