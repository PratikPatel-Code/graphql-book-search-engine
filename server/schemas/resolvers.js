const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { Book } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id }).populate("savedBooks");
      }
      throw new AuthenticationError("You need to be logged in!");
    },
  },

  // Set up mutations for login, then create/add User, add/save book, and remove/delete book
  Mutation: {
    //login mutation
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("User Not Found!!!");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Wrong Password!!!");
      }

      const token = signToken(user);

      return { token, user };
    },
    // Adding a user
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);
      return { token, user };
    },
    // Adding book
    saveBook: async (parent, args, context) => {
      const updatedUser = await User.findOneAndUpdate(
        { _id: context.user._id },
        { $addToSet: { savedBooks: { ...args } } }
      );
      return updatedUser;
    },
    // Delete Book
    removeBook: async (parent, { bookId }, context) => {
      console.log(context.user._id);
      const updatedUser = await User.findOneAndUpdate(
        { _id: context.user._id },
        { $pull: { savedBooks: { bookId: bookId } } }
      );
      return updatedUser;
    },
  },
};

module.exports = resolvers;
