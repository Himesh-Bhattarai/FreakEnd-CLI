#!/usr/bin/env node

const mongoose = require('mongoose');
const readline = require('readline');
const User = require('./models/User');
const SeederService = require('./services/seeder.services');
const SeederUtils = require('./utils/seeder.utils');

// Load environment variables
require('dotenv').config();

class SeederRunner {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async connectDatabase() {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      process.exit(1);
    }
  }

  async createAdminUser() {
    try {
      const adminUser = await User.findOne({ email: process.env.DEFAULT_ADMIN_EMAIL });
      
      if (!adminUser) {
        const newAdmin = new User({
          firstName: 'Admin',
          lastName: 'User',
          email: process.env.DEFAULT_ADMIN_EMAIL,
          password: process.env.DEFAULT_ADMIN_PASSWORD,
          role: 'admin',
          isActive: true
        });
        
        await newAdmin.save();
        console.log('✅ Admin user created');
        return newAdmin;
      }
      
      console.log('ℹ️ Admin user already exists');
      return adminUser;
    } catch (error) {
      console.error('❌ Failed to create admin user:', error.message);
      throw error;
    }
  }

  async promptConfirmation(message) {
    return new Promise((resolve) => {
      this.rl.question(`${message} (y/N): `, (answer) => {
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
  }

  async seedUsers(count = 10) {
    try {
      const admin = await this.createAdminUser();
      console.log(`🌱 Seeding ${count} users...`);
      
      const result = await SeederService.seedUsers(count, admin._id);
      console.log(`✅ Successfully seeded ${result.count} users in ${result.executionTime}ms`);
      
      return result;
    } catch (error) {
      console.error('❌ Failed to seed users:', error.message);
      throw error;
    }
  }

  async seedProducts(count = 20) {
    try {
      const admin = await User.findOne({ email: process.env.DEFAULT_ADMIN_EMAIL });
      console.log(`🌱 Seeding ${count} products...`);
      
      const result = await SeederService.seedProducts(count, admin._id);
      console.log(`✅ Successfully seeded ${result.count} products in ${result.executionTime}ms`);
      
      return result;
    } catch (error) {
      console.error('❌ Failed to seed products:', error.message);
      throw error;
    }
  }

  async seedCategories(count = 10) {
    try {
      const admin = await User.findOne({ email: process.env.DEFAULT_ADMIN_EMAIL });
      console.log(`🌱 Seeding ${count} categories...`);
      
      const result = await SeederService.seedCategories(count, admin._id);
      console.log(`✅ Successfully seeded ${result.count} categories in ${result.executionTime}ms`);
      
      return result;
    } catch (error) {
      console.error('❌ Failed to seed categories:', error.message);
      throw error;
    }
  }

  async seedAll() {
    try {
      const admin = await this.createAdminUser();
      console.log('🌱 Seeding all collections...');
      
      const result = await SeederService.seedAll(admin._id);
      console.log(`✅ Successfully seeded all collections in ${result.executionTime}ms`);
      
      // Display results
      Object.entries(result.results).forEach(([collection, data]) => {
        if (data.success) {
          console.log(`  - ${collection}: ${data.count} records`);
        } else {
          console.log(`  - ${collection}: Failed (${data.error})`);
        }
      });
      
      return result;
    } catch (error) {
      console.error('❌ Failed to seed all collections:', error.message);
      throw error;
    }
  }

  async resetDatabase() {
    try {
      const confirmed = await this.promptConfirmation('⚠️  Are you sure you want to reset the database? This will delete all seeded data.');
      
      if (!confirmed) {
        console.log('❌ Reset cancelled');
        return;
      }
      
      const admin = await User.findOne({ email: process.env.DEFAULT_ADMIN_EMAIL });
      console.log('🔄 Resetting database...');
      
      const result = await SeederService.resetDatabase(admin._id);
      console.log(`✅ Successfully reset database in ${result.executionTime}ms`);
      
      // Display results
      Object.entries(result.results).forEach(([collection, data]) => {
        if (data.success) {
          console.log(`  - ${collection}: ${data.deletedCount} records deleted`);
        } else {
          console.log(`  - ${collection}: Failed (${data.error})`);
        }
      });
      
      return result;
    } catch (error) {
      console.error('❌ Failed to reset database:', error.message);
      throw error;
    }
  }

  async showStats() {
    try {
      console.log('📊 Getting seeder statistics...');
      
      const result = await SeederService.getSeederStats();
      
      console.log('\n📈 Collection Statistics:');
      Object.entries(result.stats).forEach(([collection, stats]) => {
        if (stats.error) {
          console.log(`  - ${collection}: Error (${stats.error})`);
        } else {
          console.log(`  - ${collection}: Total: ${stats.total}, Seeded: ${stats.seeded}, Regular: ${stats.regular}`);
        }
      });
      
      console.log('\n📝 Recent Seeder Operations:');
      result.recentLogs.forEach((log, index) => {
        const user = log.executedBy ? `${log.executedBy.firstName} ${log.executedBy.lastName}` : 'Unknown';
        console.log(`  ${index + 1}. ${log.operation.toUpperCase()} ${log.model} - ${log.recordsAffected} records (${user}) - ${log.createdAt.toLocaleString()}`);
      });
      
      return result;
    } catch (error) {
      console.error('❌ Failed to get statistics:', error.message);
      throw error;
    }
  }

  async showMenu() {
    console.log('\n🌱 Freakend Database Seeder');
    console.log('========================');
    console.log('1. Seed Users');
    console.log('2. Seed Products');
    console.log('3. Seed Categories');
    console.log('4. Seed All Collections');
    console.log('5. Reset Database');
    console.log('6. Show Statistics');
    console.log('7. Exit');
    console.log('');
    
    return new Promise((resolve) => {
      this.rl.question('Select an option (1-7): ', (answer) => {
        resolve(parseInt(answer));
      });
    });
  }

  async run() {
    try {
      console.log('🚀 Starting Freakend Database Seeder...');
      
      // Validate configuration
      SeederUtils.validateSeederConfig();
      
      // Connect to database
      await this.connectDatabase();
      
      // Check if running with command line arguments
      const args = process.argv.slice(2);
      
      if (args.length > 0) {
        await this.handleCliArgs(args);
      } else {
        await this.interactive();
      }
      
    } catch (error) {
      console.error('❌ Seeder failed:', error.message);
      process.exit(1);
    } finally {
      this.rl.close();
      await mongoose.connection.close();
      console.log('👋 Seeder completed');
    }
  }

  async handleCliArgs(args) {
    const command = args[0];
    const count = parseInt(args[1]) || undefined;
    
    switch (command) {
      case 'users':
        await this.seedUsers(count);
        break;
      case 'products':
        await this.seedProducts(count);
        break;
      case 'categories':
        await this.seedCategories(count);
        break;
      case 'all':
        await this.seedAll();
        break;
      case 'reset':
        await this.resetDatabase();
        break;
      case 'stats':
        await this.showStats();
        break;
      default:
        console.log('❌ Invalid command. Available commands: users, products, categories, all, reset, stats');
        console.log('Usage: node seeder.runner.js <command> [count]');
        console.log('Example: node seeder.runner.js users 20');
    }
  }

  async interactive() {
    let running = true;
    
    while (running) {
      const choice = await this.showMenu();
      
      switch (choice) {
        case 1:
          const userCount = await this.promptNumber('Enter number of users to seed (default: 10): ', 10);
          await this.seedUsers(userCount);
          break;
        case 2:
          const productCount = await this.promptNumber('Enter number of products to seed (default: 20): ', 20);
          await this.seedProducts(productCount);
          break;
        case 3:
          const categoryCount = await this.promptNumber('Enter number of categories to seed (default: 10): ', 10);
          await this.seedCategories(categoryCount);
          break;
        case 4:
          await this.seedAll();
          break;
        case 5:
          await this.resetDatabase();
          break;
        case 6:
          await this.showStats();
          break;
        case 7:
          running = false;
          break;
        default:
          console.log('❌ Invalid option. Please select 1-7.');
      }
    }
  }

  async promptNumber(message, defaultValue) {
    return new Promise((resolve) => {
      this.rl.question(message, (answer) => {
        const num = parseInt(answer);
        resolve(isNaN(num) ? defaultValue : num);
      });
    });
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  const seeder = new SeederRunner();
  seeder.run();
}