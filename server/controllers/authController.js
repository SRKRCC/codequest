import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User } from "../models/User.js"
import { sendOTPEmail, deleteConfirmationMail, sendResetPassEmail } from "../utils/emailService.js"
import { isEmailValid } from "../utils/isEmailValid.js";
import mongoose from "mongoose";
import { warmupLeaderboardCache } from "../utils/leaderBoardCache.js";
import auditService from "../services/auditService.js";
import { getISTNow } from "../utils/timezone.js";
import dotenv from "dotenv";

dotenv.config();


const setAuthCookies = (res, user, token) => {
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.cookie("user", JSON.stringify({ id: user._id, email: user.email }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
    maxAge: 24 * 60 * 60 * 1000,
  });
};


export const registerUser = async (req, res) => {
  const audit = auditService.startTrace('user_registration', {
    requestId: req.auditContext?.requestId,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  try {
    const { email, name, password, username, registrationNumber, branch, collegeName, isAffiliate } = req.body;

    auditService.authEvent('registration_attempt', {
      requestId: req.auditContext?.requestId,
      email: email?.trim()?.toLowerCase(),
      username: username?.trim()?.toLowerCase(),
      ip: req.ip,
      collegeName: collegeName?.trim()
    });

    if (!name || !email || !password || !username || !registrationNumber || !branch || !collegeName) {
      auditService.authEvent('registration_validation_failed', {
        requestId: req.auditContext?.requestId,
        reason: 'missing_required_fields',
        providedFields: Object.keys(req.body)
      });
      return res.status(400).json({ error: "All fields are required" });
    }

    // Trim and validate input fields
    const trimmedName = name.trim();
    const trimmedUsername = username.trim().toLowerCase();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedRegNo = registrationNumber.trim().toUpperCase();
    const trimmedBranch = branch.trim();
    const trimmedCollege = collegeName.trim();

    // Basic validation for registration number (alphanumeric, 6-20 characters)
    const regNoRegex = /^[A-Z0-9]{6,20}$/;
    if (!regNoRegex.test(trimmedRegNo)) {
      return res.status(400).json({ error: "Registration number must be 6-20 alphanumeric characters" });
    }

    const result = await isEmailValid(trimmedEmail);

    if (!result.valid) return res.status(400).json({ message: `Please provide a valid email address, ${result.reason}` });

    const usernameRegex = /^[a-z][a-z0-9_]*$/;
    if (!usernameRegex.test(trimmedUsername)) {
      return res.status(400).json({ error: "Username must start with letters and contain only lowercase letters, numbers, and underscores" });
    }

    let session = null;
    if (process.env.NODE_ENV !== 'test') {
        session = await mongoose.startSession();
        session.startTransaction();
    }
    
    try {
      const [existingUser, existingUsername, existingRegNo] = await Promise.all([
        User.findOne({ email: trimmedEmail }).session(session),
        User.findOne({ username: trimmedUsername }).session(session),
        User.findOne({ RegistrationNumber: trimmedRegNo }).session(session)
      ]);

      if (existingUser && existingUser.isVerified) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        return res.status(400).json({ error: "Account already exists, please login" });
      }

      if (existingUsername && existingUsername.isVerified) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        return res.status(400).json({ error: "Username already exists, please choose another" });
      }

      if (existingRegNo && existingRegNo.isVerified) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        return res.status(400).json({ error: "Registration number already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const otp = crypto.randomInt(100000, 999999).toString();
      const otpExpires = getISTNow().getTime() + 5 * 60 * 1000;

      await User.findOneAndUpdate(
        { email: trimmedEmail },
        {
          $set: {
            email: trimmedEmail,
            name: trimmedName,
            username: trimmedUsername,
            password: hashedPassword,
            RegistrationNumber: trimmedRegNo,
            branch: trimmedBranch,
            collegeName: trimmedCollege,
            isAffiliate: isAffiliate || false,
            otp,
            otpExpires,
            isVerified: false,
          }
        },
        { 
          upsert: true, 
          new: true,
          setDefaultsOnInsert: true,
          session
        }
      );

      if (session) {
          await session.commitTransaction();
          session.endSession();
      }

      await sendOTPEmail(trimmedEmail, otp);

      auditService.authEvent('registration_otp_sent', {
        requestId: req.auditContext?.requestId,
        email: trimmedEmail,
        username: trimmedUsername,
        collegeName: trimmedCollege,
        branch: trimmedBranch
      });

      audit.complete({ 
        email: trimmedEmail, 
        username: trimmedUsername,
        otpSent: true 
      });

      res.status(201).json({ message: "OTP sent to email. Verify to complete registration." });
      
    } catch (error) {
      if (session) {
          await session.abortTransaction();
          session.endSession();
      }
      
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0];
        const fieldName = field === 'username' ? 'Username' : 
                         field === 'RegistrationNumber' ? 'Registration number' : 'Email';
        auditService.authEvent('registration_duplicate_error', {
          requestId: req.auditContext?.requestId,
          email: trimmedEmail,
          duplicateField: field,
          error: error.message
        });
        return res.status(400).json({ error: `${fieldName} already exists` });
      }
      
      auditService.error('Registration failed', error, {
        requestId: req.auditContext?.requestId,
        email: req.body.email,
        username: req.body.username,
        ip: req.ip
      });

      audit.error(error);
      res.status(500).json({ error: error.message });
    }
  } catch (error) {
    auditService.error('Registration failed', error, {
      requestId: req.auditContext?.requestId,
      email: req.body.email,
      username: req.body.username,
      ip: req.ip
    });

    audit.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const audit = auditService.startTrace('email_verification', {
    requestId: req.auditContext?.requestId,
    ip: req.ip
  });

  try {
    const { email, otp } = req.body;

    auditService.authEvent('verification_attempt', {
      requestId: req.auditContext?.requestId,
      email,
      ip: req.ip
    });

    const user = await User.findOne({ email });

    if (!user) {
      auditService.authEvent('verification_failed', {
        requestId: req.auditContext?.requestId,
        email,
        reason: 'user_not_found',
        ip: req.ip
      });
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isVerified) {
      auditService.authEvent('verification_failed', {
        requestId: req.auditContext?.requestId,
        email,
        userId: user._id.toString(),
        reason: 'already_verified',
        ip: req.ip
      });
      return res.status(400).json({ error: "Email already verified, Please login" });
    }

    if (user.otpExpires < getISTNow().getTime()) {
      auditService.authEvent('verification_failed', {
        requestId: req.auditContext?.requestId,
        email,
        userId: user._id.toString(),
        reason: 'otp_expired',
        ip: req.ip
      });
      await User.findByIdAndDelete(user._id);
      await warmupLeaderboardCache();
      return res.status(400).json({ error: "OTP has expired. Please request a new one." });
    }

    auditService.debug('OTP verification attempt', {
      requestId: req.auditContext?.requestId,
      userId: user._id.toString(),
      providedOtpType: typeof parseInt(otp),
      storedOtpType: typeof user.otp
    });
    if (user.otp === parseInt(otp)) {
        user.isVerified = true;
        user.otp = null;
        user.otpExpires = null;
        
        await user.save();

        auditService.userAction('email_verified', {
          requestId: req.auditContext?.requestId,
          userId: user._id.toString(),
          email: user.email,
          username: user.username,
          ip: req.ip
        });

        audit.complete({ 
          userId: user._id.toString(),
          email: user.email,
          verified: true 
        });

        res.status(200).json({ message: "Email verified and user registered successfully!" });
    } else {
      auditService.authEvent('verification_failed', {
        requestId: req.auditContext?.requestId,
        email,
        userId: user._id.toString(),
        reason: 'invalid_otp',
        ip: req.ip
      });
      throw new Error("Invalid OTP");
    }

  } catch (error) {
    auditService.error('Email verification failed', error, {
      requestId: req.auditContext?.requestId,
      email: req.body.email,
      ip: req.ip
    });

    audit.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const loginUser = async (req, res) => {
  const audit = auditService.startTrace('user_login', {
    requestId: req.auditContext?.requestId,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  try {
    const { email, password } = req.body;

    auditService.authEvent('login_attempt', {
      requestId: req.auditContext?.requestId,
      email,
      ip: req.ip
    });

    const { valid } = await isEmailValid(email);
    if (!valid) {
      auditService.authEvent('login_failed', {
        requestId: req.auditContext?.requestId,
        email,
        reason: 'invalid_email_format',
        ip: req.ip
      });
      return res.status(400).send({ message: "Please provide a valid email address." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      auditService.security('login_attempt_nonexistent_user', {
        requestId: req.auditContext?.requestId,
        email,
        ip: req.ip
      });
      return res.status(401).json({ error: "No user found" });
    }

    if (!user.isVerified) {
      auditService.authEvent('login_failed', {
        requestId: req.auditContext?.requestId,
        email,
        userId: user._id.toString(),
        reason: 'email_not_verified',
        ip: req.ip
      });
      return res.status(400).json({ error: "Email not verified" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      auditService.security('login_failed_wrong_password', {
        requestId: req.auditContext?.requestId,
        email,
        userId: user._id.toString(),
        ip: req.ip
      });
      return res.status(400).json({ error: "Wrong Password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    
    auditService.userAction('login_successful', {
      requestId: req.auditContext?.requestId,
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    setAuthCookies(res, user, token);

    audit.complete({ 
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
      loginSuccessful: true 
    });

    return res.status(200).json({ message: "Login Successful" });
  } catch (error) {
    auditService.error('Login failed', error, {
      requestId: req.auditContext?.requestId,
      email: req.body.email,
      ip: req.ip
    });

    audit.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const googleAuthCallback = (req, res) => {
  const { user, token } = req.user;
  setAuthCookies(res, user, token);
  res.redirect(`${process.env.CLIENT_URL}/challenges`);
};

export const githubAuthCallback = (req, res) => {
  const { user, token } = req.user;
  setAuthCookies(res, user, token);
  res.redirect(`${process.env.CLIENT_URL}/challenges`);
};


export const logoutUser = async (req, res) => {
  try {
    auditService.userAction('user_logout', {
      requestId: req.auditContext?.requestId,
      userId: req.user?._id?.toString(),
      email: req.user?.email,
      ip: req.ip
    });

    // Clear JWT cookie
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
    });

    // Clear user cookie
    res.clearCookie("user", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    auditService.error('User logout error', error, {
      requestId: req.auditContext?.requestId,
      userId: req.user?._id?.toString(),
      ip: req.ip
    });
    res.status(500).json({ error: "Server error during logout" });
  }
};


export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.isVerified) return res.status(404).json({ message: "Verify your email first" });

    // Generate Reset Token (JWT)
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });

    // Save Token & Expiry in DB
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = getISTNow().getTime() + 15 * 60 * 1000;
    await user.save();

    // Send Reset Link via Email
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendResetPassEmail(user.email, resetLink);

    res.status(200).json({ message: "Reset link sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Server Error1", error });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  // console.log(token);

  try {
    // Verify JWT Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    const nowIST = getISTNow();
    if (!user || user.resetPasswordToken !== token || user.resetPasswordExpires < nowIST.getTime()) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    // Hash New Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update Password in DB
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token1", error });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    // Fetch full user data from database
    const user = req.user;
    const token = req.token;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!token) {
      return res.status(401).json({ message: "Token not found" });
    }

    res.json({ user, token });
  } catch (error) {
    // console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteUser = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const requestingUserId = req.user._id;

    // Authorization check
    if (id !== requestingUserId.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ error: 'Unauthorized to delete this account' });
    }

    // Verify user exists
    const user = await User.findById(id);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: 'User not found' });
    }

    // try {
    //   await client.collections("users").documents(id.toString()).delete();
    //   console.log(`Deleted user ${id} from Typesense`);
    // } catch (typesenseError) {
    //   // Only ignore "Not Found" errors
    //   if (!typesenseError.message.includes("Not Found")) {
    //     await session.abortTransaction();
    //     session.endSession();
    //     throw typesenseError;
    //   }
    //   console.log(`User ${id} already removed from Typesense`);
    // }

    const mail = user.email;
    // Perform deletion
    await User.findByIdAndDelete(id).session(session);

    await session.commitTransaction();
    await session.endSession();

    await warmupLeaderboardCache();

    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });

    res.clearCookie('user', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });

    deleteConfirmationMail(mail);

    return res.status(204).end(); // Proper status code for deletions

  } catch (error) {
    await session.abortTransaction().catch(abortError => {
      // console.error('Abort transaction failed:', abortError);
    });
    session.endSession();
    // console.error('Error deleting user:', error);
    return res.status(500).json({
      error: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
};