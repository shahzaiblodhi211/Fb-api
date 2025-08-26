import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  facebookId: String,
  name: String,
  email: String,
  accessToken: String,
  adAccounts: [String],
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
