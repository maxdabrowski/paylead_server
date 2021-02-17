var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var campaignSchema = new Schema({
  type: {type:String , required: true},
  campaign: {type:String , required: true},
  campaign_img:{type:String, required:true},
  commision:{type:String, required:true},
});

module.exports = mongoose.model('CampaignMdb', campaignSchema);