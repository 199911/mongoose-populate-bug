const { Mongoose } = require('mongoose');

const connectAsync = async ({ uri, name }) => {
  const mongoose = new Mongoose();
  return mongoose.connect(
    uri,
    {
      keepAlive: true,
      dbName: name,
    },
  );
};

const disconnectAsync = async (mongoose) => {
  return mongoose.disconnect();
};

module.exports = {
  connectAsync,
  disconnectAsync,
};
