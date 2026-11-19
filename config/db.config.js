const db_uri = process.env.DB;
const mongoose = require('mongoose');
mongoose.connect(db_uri).catch(() => {
  console.error("Unable to connect to MongoDB. Check DB and database availability.");
  process.exit(1);
});
module.exports = mongoose;