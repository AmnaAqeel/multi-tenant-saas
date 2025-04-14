import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
    },
    activeCompany: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "company", 
      default: null,
    },
    profilePicture: { type: String, default: "https://ui-avatars.com/api/?name=User&background=random&length=1" },    
    company: [
      {
        companyId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "company",
        },
        role: {
          type: String,
          enum: ["admin", "editor", "member"],
          default: "member",
        },
      },
    ],
    // refresh token for refreshing access token
    refreshToken: { type: String, default: null },
    refreshTokenExpires: { type: Date, default: null },

    // token for password reset
    resetToken: { type: String, default: null },
    resetTokenExpires: { type: Date, default: null },
  },
  { timestramps: true }
);

// 🔹 Hash Password Before Saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Skip if password isn't modified

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔹 Compare Entered Password with Hashed Password
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("user", UserSchema);

export default User;
