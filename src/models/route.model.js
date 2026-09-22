import mongoose from "mongoose";

const routeSchema = new mongoose.Schema(
  {
    prefix: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    targets: {
      type: [String],
      required: true,
      validate: {
        validator: (targets) => targets.length > 0,
        message: "At least one target is required",
      },
    },

    enabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Route = mongoose.model("Route", routeSchema);