// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Switch to the application database
db = db.getSiblingDB(process.env.MONGO_INITDB_DATABASE || 'freakend_db');

// Create application user with read/write permissions
db.createUser({
  user: process.env.MONGO_APP_USERNAME || 'app_user',
  pwd: process.env.MONGO_APP_PASSWORD || 'app_password',
  roles: [
    {
      role: 'readWrite',
      db: process.env.MONGO_INITDB_DATABASE || 'freakend_db'
    }
  ]
});

// Create initial collections with indexes
db.createCollection('users');
db.createCollection('sessions');
db.createCollection('logs');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "createdAt": 1 });

db.sessions.createIndex({ "userId": 1 });
db.sessions.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });

db.logs.createIndex({ "timestamp": 1 });
db.logs.createIndex({ "level": 1 });

// Insert sample data (optional)
db.users.insertOne({
  username: 'admin',
  email: 'admin@example.com',
  password: '$2b$10$example.hashed.password', // This should be properly hashed
  role: 'admin',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

print('MongoDB initialization completed successfully');
print('Database: ' + (process.env.MONGO_INITDB_DATABASE || 'freakend_db'));
print('Application user created: ' + (process.env.MONGO_APP_USERNAME || 'app_user'));