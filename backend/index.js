import { ApolloServer } from "apollo-server";
import { typeDefs } from "./schema/type-defs.js";
import { resolvers } from "./schema/resolvers.js";
import express from 'express'

import cors from 'cors'

const app = express()


const server = new ApolloServer({
    typeDefs,
    resolvers,
    graphiql : true
});

app.use(cors({ origin: "*" }));


const port = process.env.GQL_PORT  ? process.env.GQL_PORT : 4000
server.listen(port , '0.0.0.0').then(({ url }) => {
    console.log(`GQL server is running at : ${url} `);
});