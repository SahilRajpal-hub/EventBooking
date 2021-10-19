const express = require("express");
const dotenv = require("dotenv");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const bcrypt = require("bcryptjs");
const connectDb = require("./config/db");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
dotenv.config();
connectDb();

const Event = require("./models/EventModel");
const User = require("./models/UserModel");

const PORT = 3000;

app.use(
  "/graphql",
  graphqlHTTP({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
            creator: String!
        }

        type User {
            _id: ID!
            email: String!
            password: String
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
            creator: String!
        }

        input UserInput {
            email: String!
            password: String!
        }

        type RootQuery {
            events: [Event!]! 
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
      events: async () => {
        try {
          const events = await Event.find();
          return events;
        } catch (err) {
          console.log(err);
        }
      },
      createEvent: async (args) => {
        // "616eb68062e3433d14ed2ce5";
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: args.eventInput.price,
          date: new Date(args.eventInput.date),
          creator: args.eventInput.creator,
        });

        try {
          const savedEvent = await event.save();
          const userFetch = await User.findById(event.creator);
          userFetch.createdEvents.push(event._id);
          await userFetch.save();
          return savedEvent;
        } catch (err) {
          console.error(err);
        }
      },
      createUser: async (args) => {
        const userExist = await User.findOne({ email: args.userInput.email });
        if (userExist) {
          throw new Error("User already exist");
        }
        const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
        const user = new User({
          email: args.userInput.email,
          password: hashedPassword,
        });

        try {
          const savedUser = await user.save();
          return { email: savedUser.email, _id: savedUser._id, password: null };
        } catch (err) {
          console.error(err);
        }
      },
    },
    graphiql: true,
  })
);

app.listen(PORT, (req, res) => {
  console.log(`server is up and running on ${PORT} ....`);
});
