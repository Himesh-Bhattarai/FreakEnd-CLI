const { sendSuccess, sendError } = require('../../../utils/responseHandler');

// Mock user data for demonstration (same as V1 but with enhanced features)
const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', createdAt: '2024-01-01', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', createdAt: '2024-01-02', status: 'active' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user', createdAt: '2024-01-03', status: 'inactive' }
];

const getAllUsers = (req, res) => {
  try {
    // V2 returns enhanced user info including role and status
    const userData = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt
    }));

    sendSuccess(res, 200, userData, 'Users retrieved successfully (V2 Enhanced)');
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

    // V2 returns full user info including role and status
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt
    };

    sendSuccess(res, 200, userData, 'User retrieved successfully (V2 Enhanced)');
  } catch (error) {
    sendError(res, 500, 'Failed to retrieve user', error.message);
  }
};

const createUser = (req, res) => {
  try {
    const { name, email, role = 'user' } = req.body;

    if (!name || !email) {
      return sendError(res, 400, 'Name and email are required');
    }

    const newUser = {
      id: users.length + 1,
      name,
      email,
      role,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0]
    };

    users.push(newUser);

    // V2 returns full user info
    const userData = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      createdAt: newUser.createdAt
    };

    sendSuccess(res, 201, userData, 'User created successfully (V2 Enhanced)');
  } catch (error) {
    sendError(res, 500, 'Failed to create user', error.message);
  }
};

const updateUserStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = users.find(u => u.id === parseInt(id));

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    if (!['active', 'inactive'].includes(status)) {
      return sendError(res, 400, 'Status must be either "active" or "inactive"');
    }

    user.status = status;

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt
    };

    sendSuccess(res, 200, userData, 'User status updated successfully (V2 Feature)');
  } catch (error) {
    sendError(res, 500, 'Failed to update user status', error.message);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUserStatus // V2 specific feature
};