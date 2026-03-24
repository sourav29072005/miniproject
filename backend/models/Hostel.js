const mongoose = require("mongoose");

const hostelSchema = new mongoose.Schema({
  name: String,
  rent: Number,
  location: String,
  address: String,
  contact: String,
  roomType: String,
  capacity: String,
  availableRooms: String,
  distanceFromCollege: String,
  locationLink: String,
  facilities: [String],
  description: String,
  images: [String],
  status: {
    type: String,
    default: "available"
  },
  type: {
    type: String,
    enum: ["Boys", "Girls", "Common"],
    default: "Common"
  }
}, { timestamps: true });

module.exports = mongoose.model("Hostel", hostelSchema);