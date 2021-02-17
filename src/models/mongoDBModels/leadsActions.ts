var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var actionSchema = new Schema({
  lead_id: {type:Number , required: true},
  owner: {type:String , required: true},
  area:{type:String, required:true},
  region:{type:String, required:true},
  status:{type:String, required:true},
  date:{type:String, required:true},
  note:{type:String, required:false},
  policy:{type:String, required:false},
  income:{type:Number, required:false},
});

module.exports = mongoose.model('ActionMdb', actionSchema);