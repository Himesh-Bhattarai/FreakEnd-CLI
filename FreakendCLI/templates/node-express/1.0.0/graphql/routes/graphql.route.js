// templates/node-express/1.0.0/graphql/graphql.route.js
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./schema/typeDefs');
const resolvers = require('./schema/resolvers');
const { formatError } = require('./utils/errorHandling');

/**
 * Initialize Apollo GraphQL Server
 * @param {Express} app - Express application instance
 * @returns {Promise<ApolloServer>} Apollo Server instance
 */
const initializeGraphQL = async (app) => {
  try {
    // Create Apollo Server instance
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: ({ req }) => {
        // Add request context (user auth, etc.)
        return {
          req,
          user: req.user || null, // Assumes auth middleware sets req.user
          isAuthenticated: !!req.user
        };
      },
      formatError,
      introspection: process.env.NODE_ENV !== 'production',
      playground: process.env.NODE_ENV !== 'production',
    });

    await server.start();

    // Apply GraphQL middleware to Express
    server.applyMiddleware({ 
      app, 
      path: '/graphql',
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true
      }
    });

    console.log(`🚀 GraphQL Server ready at http://localhost:${process.env.PORT || 3000}${server.graphqlPath}`);
    
    return server;
  } catch (error) {
    console.error('❌ GraphQL Server initialization failed:', error);
    throw error;
  }
};

module.exports = { initializeGraphQL };