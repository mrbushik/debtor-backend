import mongoose from "mongoose";

const UsersSchema = new mongoose.Schema({
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});

export const UsersModel = mongoose.model("Users", UsersSchema);
