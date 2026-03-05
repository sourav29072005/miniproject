const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cevconnect")
    .then(async () => {
        const users = await User.find({}, "email role");
        console.log("Registered Users:", users);
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
