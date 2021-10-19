const express = require("express");
const dotenv = require("dotenv");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const connectDb = require("./config/db");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
dotenv.config();
connectDb();

const Event = require("./models/EventModel");

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
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootQuery {
            events: [Event!]! 
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
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
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: args.eventInput.price,
          date: new Date(args.eventInput.date),
        });

        try {
          const savedEvent = await event.save();
          return savedEvent;
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
