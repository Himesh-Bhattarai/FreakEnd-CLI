// templates/node-express/1.0.0/graphql/schema/typeDefs.js
const { gql } = require('apollo-server-express');

const typeDefs = gql`
  scalar Date

  # User Type
  type User {
    id: ID!
    username: String!
    email: String!
    firstName: String
    lastName: String
    avatar: String
    bio: String
    createdAt: Date!
    updatedAt: Date!
    posts: [Post!]!
    postCount: Int!
  }

  # Post Type
  type Post {
    id: ID!
    title: String!
    content: String!
    excerpt: String
    slug: String!
    status: PostStatus!
    featuredImage: String
    tags: [String!]!
    author: User!
    createdAt: Date!
    updatedAt: Date!
    likesCount: Int!
    commentsCount: Int!
  }

  # Comment Type
  type Comment {
    id: ID!
    content: String!
    author: User!
    post: Post!
    createdAt: Date!
    updatedAt: Date!
  }

  # Enums
  enum PostStatus {
    DRAFT
    PUBLISHED
    ARCHIVED
  }

  enum SortOrder {
    ASC
    DESC
  }

  # Input Types
  input CreateUserInput {
    username: String!
    email: String!
    password: String!
    firstName: String
    lastName: String
    bio: String
  }

  input UpdateUserInput {
    username: String
    email: String
    firstName: String
    lastName: String
    bio: String
    avatar: String
  }

  input CreatePostInput {
    title: String!
    content: String!
    excerpt: String
    status: PostStatus = DRAFT
    featuredImage: String
    tags: [String!] = []
  }

  input UpdatePostInput {
    title: String
    content: String
    excerpt: String
    status: PostStatus
    featuredImage: String
    tags: [String!]
  }

  input CreateCommentInput {
    content: String!
    postId: ID!
  }

  input PostsFilter {
    status: PostStatus
    authorId: ID
    tags: [String!]
    search: String
  }

  input PostsSort {
    field: String = "createdAt"
    order: SortOrder = DESC
  }

  # Pagination
  input PaginationInput {
    page: Int = 1
    limit: Int = 10
  }

  type PaginationInfo {
    currentPage: Int!
    totalPages: Int!
    totalItems: Int!
    hasNextPage: Boolean!
    hasPrevPage: Boolean!
  }

  type PostsConnection {
    posts: [Post!]!
    pagination: PaginationInfo!
  }

  type UsersConnection {
    users: [User!]!
    pagination: PaginationInfo!
  }

  # Response Types
  type AuthResponse {
    token: String!
    user: User!
    expiresIn: String!
  }

  type MutationResponse {
    success: Boolean!
    message: String!
  }

  # Root Types
  type Query {
    # User Queries
    me: User
    user(id: ID!): User
    users(pagination: PaginationInput, search: String): UsersConnection!
    
    # Post Queries
    post(id: ID, slug: String): Post
    posts(
      filter: PostsFilter
      sort: PostsSort
      pagination: PaginationInput
    ): PostsConnection!
    
    # Comment Queries
    comments(postId: ID!, pagination: PaginationInput): [Comment!]!
    
    # Stats
    stats: Stats!
  }

  type Mutation {
    # User Mutations
    register(input: CreateUserInput!): AuthResponse!
    login(email: String!, password: String!): AuthResponse!
    updateProfile(input: UpdateUserInput!): User!
    deleteAccount: MutationResponse!
    
    # Post Mutations
    createPost(input: CreatePostInput!): Post!
    updatePost(id: ID!, input: UpdatePostInput!): Post!
    deletePost(id: ID!): MutationResponse!
    likePost(id: ID!): MutationResponse!
    unlikePost(id: ID!): MutationResponse!
    
    # Comment Mutations
    createComment(input: CreateCommentInput!): Comment!
    updateComment(id: ID!, content: String!): Comment!
    deleteComment(id: ID!): MutationResponse!
  }

  # Subscription (for real-time features)
  type Subscription {
    postCreated: Post!
    postUpdated(id: ID!): Post!
    commentAdded(postId: ID!): Comment!
  }

  # Stats Type
  type Stats {
    totalUsers: Int!
    totalPosts: Int!
    totalComments: Int!
    postsToday: Int!
    activeUsers: Int!
  }
`;

module.exports = typeDefs;