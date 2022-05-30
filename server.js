const { ApolloServer, gql } = require("apollo-server-express");
const express = require("express");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const bodyParser = require("body-parser");
const app = express();
const typeDefs = gql`
  type File {
    url: String!
  }

  type Query {
    hello: String!
  }

  type Mutation {
    uploadFile(file: Upload!): File!
  }
`;
const generateRandom = () =>
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(23).substring(2, 5);

const resolvers = {
  Query: {
    hello: () => "Hello world!",
  },

  Mutation: {
    uploadFile: async (_, { file }) => {
      const { createReadStream, filename } = await file;
      const { ext, name } = path.parse(filename);
      const uniquename = generateRandom() + name.split(" ").join("_") + ext;
      const stream = createReadStream();
      const pathname = path.join(__dirname, `public/images/${uniquename}`);
      await stream.pipe(fs.createWriteStream(pathname));
      return { url: `http://localhost:4000/images/${uniquename}` };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.applyMiddleware({ app });
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen({ port: 4000 }, () => {
  console.log(`🚀 Server ready at http://localhost:4000`);
});
