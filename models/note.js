
var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var NoteSchema = new Schema({

  title: {
    type: String
  },

  body: {
    type: String
  },
    
 // img: {
   // type: Image
// }
});

var Note = mongoose.model("notes", NoteSchema);

module.exports = Note; 
