const mongoose = require("mongoose");
const { Schema } = mongoose;
const {getNotAllowedCategoryProducts} = require("../products/products.helpers");

const UserSchema = new Schema(
  {
    name: { type: String, require: true },
    login: { type: String, require: true },
    password: { type: String, require: true },
    status: {
      type: String,
      required: true,
      enum: ["Verified", "Created"],
      default: "Created",
    },
    token: { type: String, required: false },
    verificationToken: { type: String, default: "", required: false },
    summary: {
      height: Number,
      age: Number,
      currentWeight: Number,
      targetWeight: Number,
      bloodType: {type: Number, enum: [1, 2, 3 ,4]}
    },
    dayNormCalories: Number,
    notAllowedCategories: [{type: String}]
  },
  { versionKey: false, minimize: false },
);

// Static methods

UserSchema.statics.findByVerificationToken = findByVerificationToken;
UserSchema.statics.verifyUser = verifyUser;
UserSchema.statics.findUserByLogin = findUserByLogin;
UserSchema.statics.updateToken = updateToken;
UserSchema.statics.findByIdUpdateSummary = findByIdUpdateSummary;

async function findByVerificationToken(verificationToken) {
  return this.findOne({ verificationToken });
}

async function verifyUser(userId) {
  return this.findByIdAndUpdate(
    userId,
    { status: "Verified", verificationToken: null },
    { new: true }
  );
}

async function findUserByLogin(login) {
  return this.findOne({ login });
}

async function updateToken(id, newToken) {
  return this.findByIdAndUpdate(id, {
    token: newToken,
  });
}

async function findByIdUpdateSummary(id, summary) {
  return this.findByIdAndUpdate(id,
    {
      summary: {...summary},
      dayNormCalories: 4000, // Сашину формулу для результата
      notAllowedCategories: [...(await getNotAllowedCategoryProducts(summary.bloodType))]
    },
    {
      projection: {
        name: true,
        "summary.height": true,
        "summary.age": true,
        "summary.currentWeight": true,
        "summary.targetWeight": true,
        "summary.bloodType": true,
        dayNormCalories: true,
        notAllowedCategories: true
      }
    });
}

module.exports = mongoose.model("User", UserSchema);
