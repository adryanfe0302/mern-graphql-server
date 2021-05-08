const { ApolloServer, PubSub } = require('apollo-server');
const mongoose = require('mongoose')
const { MONGODB } = require('./config.js')
const typeDefs = require('./graphql/typeDefs')
const resolvers = require('./graphql/resolvers')


// for subscriptions
const pubsub = new PubSub()

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req, pubsub })
}) 

mongoose.connect(MONGODB, { useUnifiedTopology: true, useNewUrlParser: true })
.then(() => {
    console.log('mongodb connect');
    return server.listen({ port: 5000 })
})
.then((res) => {
    console.log(`server running at ${res.url}`)
})