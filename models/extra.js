const mongoose=require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  extraName:{type:String, required: true}
});

module.exports= mongoose.model('Extra', schema);
