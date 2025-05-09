// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions, Profile, Account, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
// Import CredentialsProvider if you still plan to use it
// import CredentialsProvider from "next-auth/providers/credentials";

// Define a type for the user object returned by your backend
interface BackendUser {
  id: string; // This should be your MongoDB _id
  email: string;
  name?: string;
  avatar?: string; // Corresponds to 'image' in NextAuth session user
  username?: string; // If your backend returns it and you want it in the token/session
  // Add any other fields your backend returns and you need in the JWT/session
}

/**
 * Configuration options for NextAuth.js.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }),
    // ... other providers like CredentialsProvider if you use them
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    /**
     * The `signIn` callback is called when a user attempts to sign in.
     * We use this to interact with our backend to find or create a user.
     * The `user` object passed here from the provider will be augmented with
     * the `id` (your MongoDB _id) from your backend.
     */
    async signIn({ user, account, profile }) {
      // Only proceed if it's an OAuth provider we want to handle (e.g., Google or GitHub)
      if (account && (account.provider === "google" || account.provider === "github")) {
        // Ensure profile exists and has necessary fields (email is usually essential)
        if (!profile?.email) {
          console.error("OAuth profile or email missing for provider:", account.provider, profile);
          // You might want to redirect to an error page or return false to deny sign-in
          return false;
        }

        try {
          // Prepare data to send to your backend
          const providerUserDetails = {
            email: profile.email,
            name: profile.name || user.name, // Use profile.name, fallback to user.name
            avatar: profile.image || user.image, // Use profile.image, fallback to user.image
            provider: account.provider,
            providerAccountId: user.id, // user.id from OAuth provider is their unique ID on that platform
          };

          // Construct the backend API URL
          // Ensure NEXT_PUBLIC_BACKEND_URL is set in your .env.local
          const backendApiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/oauth-handler`;
          if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
            console.error("Error: NEXT_PUBLIC_BACKEND_URL is not set. Cannot call backend.");
            return false; // Deny sign-in
          }

          console.log("Attempting to call backend API:", backendApiUrl);
          console.log("Sending user details to backend:", providerUserDetails);


          const response = await fetch(backendApiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(providerUserDetails),
          });

          if (!response.ok) {
            const errorData = await response.text(); // Get text for more detailed error
            console.error(
              `Backend error during OAuth user processing (status: ${response.status}):`,
              errorData
            );
            return false; // Deny sign-in if backend processing fails
          }

          const backendUser: BackendUser = await response.json();
          console.log("Received user from backend:", backendUser);


          // If backend returns a user with an ID (your MongoDB _id), proceed.
          // Augment the NextAuth `user` object with the ID from your database.
          // This `user.id` will then be available in the `jwt` callback.
          if (backendUser && backendUser.id) {
            user.id = backendUser.id; // CRITICAL: This sets the ID for the JWT to your internal DB ID
            user.email = backendUser.email; // Ensure email is consistent from your DB
            user.name = backendUser.name;   // Ensure name is consistent from your DB
            user.image = backendUser.avatar; // Ensure avatar (image) is consistent from your DB
            (user as any).username = backendUser.username; // If you want username in JWT/session
            return true; // Allow sign-in
          } else {
            console.error("Backend did not return a valid user object with an ID.");
            return false; // Deny sign-in
          }
        } catch (error) {
          console.error("Error during signIn callback communicating with backend:", error);
          return false; // Deny sign-in on error
        }
      }
      // For Credentials provider or other flows, you might have different logic
      if (account?.provider === "credentials") {
        // Assuming `user` object from Credentials authorize callback already contains your internal ID
        return true;
      }
      // Default to allow sign-in for other unhandled cases, or if not an OAuth provider we're syncing.
      // However, for a strict setup, you might want to return false if the provider isn't explicitly handled.
      return true;
    },

    /**
     * The `jwt` callback is called whenever a JSON Web Token is created or updated.
     */
    async jwt({ token, user, account, profile }) {
      // After signIn, the `user` object here will include the `id` (your MongoDB _id)
      // that we assigned in the `signIn` callback if it was an OAuth login.
      // For credentials login, `user.id` should already be your internal ID.
      if (user) {
        token.id = user.id; // Persist your internal user ID to the token
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image; // NextAuth uses 'picture' for image in token, maps to session.user.image
        // If you added username to the user object in signIn:
        if ((user as any).username) {
          token.username = (user as any).username;
        }
      }
      return token;
    },

    /**
     * The `session` callback is called whenever a session is checked.
     */
    async session({ session, token }) {
      // The token contains the `id` (your MongoDB _id) from the `jwt` callback.
      // Assign it to the session object to make it available on the client-side.
      if (token && session.user) {
        (session.user as any).id = token.id as string; // Add your internal user ID to the session
        // session.user.name = token.name as string | null | undefined; // Already handled if in token
        // session.user.email = token.email as string | null | undefined; // Already handled if in token
        // session.user.image = token.picture as string | null | undefined; // Handled by token.picture

        // If you added username to the token in jwt callback:
        if (token.username) {
          (session.user as any).username = token.username as string;
        }
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",

  // If you have custom pages:
  // pages: {
  //   signIn: '/login',
  // },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
