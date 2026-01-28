import RoleType from '../../lib/types.js';
import mongoose from 'mongoose';
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import { accessTokenExpires, accessTokenSecrete, refreshTokenExpires, refreshTokenSecrete } from '../../core/config/config.js';


const AddressSchema = new mongoose.Schema({
  country: { type: String, default: '' },
  cityState: { type: String, default: '' },
  roadArea: { type: String, default: '' },
  postalCode: { type: String, default: '' },
  taxId: { type: String, default: '' }
}, { _id: false });


const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    name: { type: String, default: '', trim: true }, // kept for backward compatibility/queries
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: '', trim: true },
    username: { type: String },
    dob: { type: Date, default: null },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'male'
    },

    role: {
      type: String,
      default: RoleType.USER,
      enum: [RoleType.USER, RoleType.ADMIN],
    },

    stripeAccountId: { type: String, default: null },

    bio: { type: String, default: '' },
    address: { type: AddressSchema, default: () => ({}) },

    profileImage: { type: String, default: '' },
    multiProfileImage: { type: [String], default: [] },
    pdfFile: { type: String, default: '' },

    otp: {
      type: String,
      default: null
    },

    otpExpires: {
      type: Date,
      default: null
    },

    otpVerified : {
      type: Boolean,
      default: false
    },

    resetExpires : {
      type: Date,
      default: null
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    refreshToken: {
      type: String,
      default: ''
    },

    hasActiveSubscription: { type: Boolean, default: false },
    subscriptionExpireDate: { type: Date, default: null },
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    language: { type: String, default: 'en' }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

UserSchema.virtual('fullName').get(function () {
  return [this.firstName, this.lastName].filter(Boolean).join(' ').trim();
});


// Sync full name for backward compatibility
UserSchema.pre('save', function (next) {
  this.name = [this.firstName, this.lastName].filter(Boolean).join(' ').trim();
  next();
});

// Hashing password
UserSchema.pre("save", async function (next) {

  if (!this.isModified("password")) return next();

  const hashedPassword = await bcrypt.hash(this.password, 10);

  this.password = hashedPassword;
  next();
});

UserSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() || {};
  const $set = update.$set || update;
  const hasFirst = $set.firstName !== undefined;
  const hasLast = $set.lastName !== undefined;

  if (hasFirst || hasLast) {
    const firstName = hasFirst ? $set.firstName : this._update.firstName;
    const lastName = hasLast ? $set.lastName : this._update.lastName;
    const combined = [firstName, lastName].filter(Boolean).join(' ').trim();

    if (update.$set) {
      this._update.$set.name = combined;
    } else {
      this._update.name = combined;
    }
  }

  next();
});

// Password comparison method (bcrypt)
UserSchema.methods.comparePassword = async function (id, plainPassword) {
  const { password: hashedPassword } = await User.findById(id).select('password')

  const isMatched = await bcrypt.compare(plainPassword, hashedPassword)

  return isMatched
}

// Generate ACCESS_TOKEN
UserSchema.methods.generateAccessToken = function (payload) {
  return jwt.sign(payload, accessTokenSecrete, { expiresIn: accessTokenExpires });
};

// Generate REFRESH_TOKEN
UserSchema.methods.generateRefreshToken = function (payload) {
  return jwt.sign(payload, refreshTokenSecrete, { expiresIn: refreshTokenExpires });
};

const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;
