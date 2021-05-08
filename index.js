const { ApolloServer, PubSub } = require('apollo-server');
const mongoose = require('mongoose')
const { MONGODB } = require('./config.js')
const typeDefs = require('./graphql/typeDefs')
const resolvers = require('./graphql/resolvers')

const PORT = process.env.PORT || 5000
// for subscriptions
const pubsub = new PubSub()

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req, pubsub }),
    introspection: true,
    playground: true,
}) 

mongoose.connect(MONGODB, { useUnifiedTopology: true, useNewUrlParser: true })
.then(() => {
    console.log('mongodb connect');
    return server.listen({ port: PORT })
})
.then((res) => {
    console.log(`server running at ${res.url}`)
})