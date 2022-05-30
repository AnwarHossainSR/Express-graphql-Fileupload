const { ApolloServer, gql } = require("apollo-server-express");
const express = require("express");
const fs = require("fs");
const GraphQLUpload = require("graphql-upload/GraphQLUpload.js");
const graphqlUploadExpress = require("graphql-upload/graphqlUploadExpress.js");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const typeDefs = gql`
  scalar Upload
  type File {
    url: String!
  }
  type Query {
    otherFields: Boolean!
  }
  type Mutation {
    uploadFile(file: Upload!): File!
  }
`;

const fileRenamer = (filename) => {
  const queHoraEs = Date.now();
  const regex = /[\s_-]/gi;
  const fileTemp = filename.replace(regex, ".");
  let arrTemp = [fileTemp.split(".")];
  return `${arrTemp[0]
    .slice(0, arrTemp[0].length - 1)
    .join("_")}${queHoraEs}.${arrTemp[0].pop()}`;
};
const resolvers = {
  Upload: GraphQLUpload,
  Mutation: {
    uploadFile: async (_, { file }) => {
      const { createReadStream, filename, mimetype } = await file;
      const stream = createReadStream();
      const assetUniqName = fileRenamer(filename);
      const pathName = path.join(__dirname, `public/images/${assetUniqName}`);
      await stream.pipe(fs.createWriteStream(pathName));
      const url = `http://localhost:4001/images/${assetUniqName}`;
      return { url };
    },
  },
};

async function startServer() {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  const app = express();
  app.use(graphqlUploadExpress());
  server.applyMiddleware({ app });
  app.use(cors());
  app.use(express.static(path.join(__dirname, "public")));
  app.use(express.static("public"));
  app.use(bodyParser.urlencoded({ extended: true }));
  //   await new Promise((r) => app.listen({ port: 4001 }, r));
  //   console.log(
  //     `🚀 Server ready at     http://localhost:4001${server.graphqlPath}`
  //   );
  app.listen({ port: 4001 }, () => {
    console.log(
      `🚀 Server ready at http://localhost:4001${server.graphqlPath}`
    );
  });
}
startServer();
