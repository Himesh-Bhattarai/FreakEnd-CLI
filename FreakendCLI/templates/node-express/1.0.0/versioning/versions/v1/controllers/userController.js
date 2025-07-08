const { sendSuccess, sendError } = require('../../../utils/responseHandler');

// Mock user data for demonstration
const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user' }
];

const getAllUsers = (req, res) => {
  try {
    // V1 returns basic user info
    const userData = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email
    }));

    sendSuccess(res, 200, userData, 'Users retrieved successfully');
  } catch (error) {
    sendError(res, 500, 'Failed to retrieve users', error.message);
  }
};

const getUserById = (req, res) => {
  try {
    const { id } = req.params;
    const user = users.find(u => u.id === parseInt(id));

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // V1 returns basic user info without role
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    sendSuccess(res, 200, userData, 'User retrieved successfully');
  } catch (error) {
    sendError(res, 500, 'Failed to retrieve user', error.message);
  }
};

const createUser = (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return sendError(res, 400, 'Name and email are required');
    }

    const newUser = {
      id: users.length + 1,
      name,
      email,
      role: 'user' // Default role in V1
    };

    users.push(newUser);

    // V1 returns basic user info
    const userData = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email
    };

    sendSuccess(res, 201, userData, 'User created successfully');
  } catch (error) {
    sendError(res, 500, 'Failed to create user', error.message);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser
};