import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    description: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
      match: [
        /^(https?:\/\/)?([\w\-]+\.)+[a-z]{2,}(\/\S*)?$/i,
        "Please enter a valid URL",
      ],
    },
    employees: {
      type: String,
      enum: ["1-10", "11-50", "51-200", "201-500", "500+"],
    },
    logo: {
      type: String, // URL of the logo (optional)
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        role: {
          type: String,
          enum: ["admin", "editor", "member"],
          default: "member",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);


const Company = mongoose.model("Company", companySchema);

export default Company;
