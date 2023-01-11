const mongoose = require("mongoose");

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true,
    // useFindAndModify: false,
  });

  console.log(`MongoDB Connected: ${conn.connection.host} at port: ${conn.connection.port}`.cyan.underline);
};

module.exports = connectDB;