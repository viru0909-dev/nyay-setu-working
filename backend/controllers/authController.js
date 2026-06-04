const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'No credential provided' });
    }

    // Verify the ID token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { email, name, picture, email_verified } = payload;

    if (!email_verified) {
      return res.status(403).json({ message: 'Google email is not verified.' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // Update existing user profile if changed
      let updated = false;
      if (user.name !== name) {
        user.name = name;
        updated = true;
      }
      if (user.picture !== picture) {
        user.picture = picture;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    } else {
      // Create a new user
      user = new User({
        email,
        name,
        picture,
        isOAuth: true,
        role: 'LITIGANT' // Default role
      });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Authentication failed', error: error.message });
  }
};
