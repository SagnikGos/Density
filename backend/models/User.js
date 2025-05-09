// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true, // Good for search performance
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true, // Good practice for emails
  },
  name: { // Full name from OAuth provider, can be different from username
    type: String,
    trim: true,
  },
  avatar: { // URL to avatar image
    type: String,
  },
  authProviders: [{ // To store which OAuth providers the user has connected
    provider: { type: String, required: true }, // e.g., 'google', 'github'
    providerAccountId: { type: String, required: true }, // User's ID from the provider
  }],
  // Add other fields from your original full schema if needed, e.g., bio, followers, etc.
}, { timestamps: true }); // Adds createdAt and updatedAt automatically

/**
 * Static method to find an existing user or create a new one based on OAuth profile data.
 * It also links the OAuth provider account to the user.
 * @param {object} details - User details from OAuth provider.
 * @param {string} details.email - User's email.
 * @param {string} [details.name] - User's full name.
 * @param {string} [details.avatar] - URL to user's avatar.
 * @param {string} details.provider - Name of the OAuth provider (e.g., 'google').
 * @param {string} details.providerAccountId - User's unique ID from the OAuth provider.
 * @returns {Promise<mongoose.Document>} The found or created user document.
 */
userSchema.statics.findOrCreateFromOAuth = async function ({ email, name, avatar, provider, providerAccountId }) {
  try {
    let user = await this.findOne({ email });

    if (user) {
      // User exists, update their info if necessary and ensure provider is linked
      user.name = name || user.name; // Update name if provided by OAuth and not already set
      user.avatar = avatar || user.avatar; // Update avatar if provided

      // Check if this provider is already linked
      const providerExists = user.authProviders.some(
        p => p.provider === provider && p.providerAccountId === providerAccountId
      );

      if (!providerExists) {
        user.authProviders.push({ provider, providerAccountId });
      }
    } else {
      // User does not exist, create a new one.
      // Generate a username. This is a simple strategy and might need to be more robust
      // to ensure uniqueness in a production environment, especially if many users
      // might have similar email prefixes. Consider adding a check for username uniqueness
      // or prompting the user to choose a username post-registration.
      let baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ''); // Sanitize and use email prefix
      let potentialUsername = baseUsername;
      let count = 0;
      // Loop to find a unique username if the base one is taken
      while (await this.findOne({ username: potentialUsername })) {
        count++;
        potentialUsername = `${baseUsername}${count}`;
      }

      user = new this({
        email,
        name, // Full name from provider
        avatar,
        username: potentialUsername, // Generated unique username
        authProviders: [{ provider, providerAccountId }],
      });
    }

    await user.save();
    return user;
  } catch (error) {
    console.error("Error in findOrCreateFromOAuth:", error);
    // If it's a duplicate key error for username during a race condition,
    // you might want to retry username generation or handle it more gracefully.
    throw error; // Re-throw to be caught by the route handler
  }
};

// Export the model, ensuring it's not re-defined if already compiled (common in dev environments)
export default mongoose.models.User || mongoose.model('User', userSchema);
