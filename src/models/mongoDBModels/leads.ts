var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var leadSchema = new Schema({
  lead_id: {type:Number , required: true},
  name: {type:String , required: true},
  surname: {type:String , required: true},
  phone:{type:String, required:true},
  mail:{type:String, required:true},
  town:{type:String, required:true},
  post_code:{type:String, required:true},
  adress:{type:String, required:true},
  client_type:{type:String, required:true},
  age:{type:String, required:false},
  type:{type:String, required:true},
  campaign:{type:String, required:true},
  product:{type:String, required:false},
  campaign_image:{type:String, required:true},
  price:{type:Number, required:true},
  region:{type:String, required:true},
  area:{type:String, required:true},
  owner:{type:String, required:false},
  status:{type:String, required:true},
});

module.exports = mongoose.model('LeadMdb', leadSchema);
