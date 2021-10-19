const mongoose = require("mongoose");

module.exports = connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(
      `connect successful with the database on port ${conn.connection.port}`
    );
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
