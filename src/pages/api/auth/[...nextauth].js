import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import User from "@/models/User/User";
import dbConnect from "@/database/mongoDb/db";
const options = {
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // Credentials Provider for email/password
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "example@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect(); // Ensure a database connection with Mongoose

        // Check if user exists
        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          throw new Error("No user found with this email");
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValidPassword) {
          throw new Error("Incorrect password");
        }
        console.log("login process started");

        // Return user object if authentication successful
        return {
          id: user._id,
          name: user.username,
          email: user.email,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      await dbConnect();
      if (account.provider === "google") {
        // Check if user exists in MongoDB
        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          // Create a new MongoDB user document with default fields

          const newUser = await User.create({
            email: user.email,
            username: user.name,
          });

          // Assign the newly created user's _id to the user object
          user.id = newUser._id.toString(); // Ensure user.id is a string for consistency
          user.name = newUser.username;
        } else {
          // For existing users, assign their MongoDB _id to the user object
          user.id = existingUser._id.toString(); // Ensure user.id is a string for consistency
          user.name = existingUser.username;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      // Persist additional user information in token
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }

      return token;
    },
    async session({ session, token }) {
      // Persist token data into session
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.email = token.email;
      return session;
    },
  },
  pages: {
    signIn: "/auth",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt", // Using JWT for session storage
    maxAge: 2 * 24 * 60 * 60,
  },
};

export default NextAuth(options);
