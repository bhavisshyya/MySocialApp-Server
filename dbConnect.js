const mongoose = require("mongoose");

module.exports = async () => {
  const mongoURri =
    "mongodb+srv://bhavishy:Tf7w8B1V0wtorD3F@atlascluster.fp07zqk.mongodb.net/?retryWrites=true&w=majority";

  try {
    const connect = await mongoose.connect(mongoURri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`Mongo Db connected: ${connect.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
