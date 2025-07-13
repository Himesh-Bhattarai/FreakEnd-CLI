const { faker } = require('@faker-js/faker');

class SeedDataGenerator {
  static generateUsers(count = 10) {
    const users = [];
    
    for (let i = 0; i < count; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      
      users.push({
        firstName,
        lastName,
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        password: 'Password@123', // Will be hashed by pre-save hook
        role: i === 0 ? 'admin' : faker.helpers.arrayElement(['user', 'moderator']),
        isActive: faker.datatype.boolean(0.9), // 90% active
        profile: {
          avatar: faker.image.avatar(),
          phone: faker.phone.number(),
          address: {
            street: faker.location.streetAddress(),
            city: faker.location.city(),
            state: faker.location.state(),
            zipCode: faker.location.zipCode(),
            country: faker.location.country()
          }
        },
        preferences: {
          newsletter: faker.datatype.boolean(0.7),
          notifications: faker.datatype.boolean(0.8)
        },
        lastLogin: faker.date.recent({ days: 30 }),
        isSeeded: true
      });
    }
    
    return users;
  }

  static generateProducts(count = 20) {
    const products = [];
    
    for (let i = 0; i < count; i++) {
      products.push({
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
        category: faker.commerce.department(),
        sku: faker.string.alphanumeric(8).toUpperCase(),
        stock: faker.number.int({ min: 0, max: 100 }),
        images: [
          faker.image.url({ width: 640, height: 480 }),
          faker.image.url({ width: 640, height: 480 })
        ],
        tags: faker.helpers.arrayElements([
          'electronics', 'clothing', 'books', 'home', 'sports', 'beauty'
        ], { min: 1, max: 3 }),
        isActive: faker.datatype.boolean(0.9),
        rating: parseFloat(faker.number.float({ min: 1, max: 5 }).toFixed(1)),
        isSeeded: true
      });
    }
    
    return products;
  }

  static generateCategories(count = 10) {
    const categories = [];
    
    for (let i = 0; i < count; i++) {
      categories.push({
        name: faker.commerce.department(),
        description: faker.lorem.sentence(),
        slug: faker.helpers.slugify(faker.commerce.department()).toLowerCase(),
        image: faker.image.url({ width: 300, height: 200 }),
        isActive: faker.datatype.boolean(0.9),
        sortOrder: i,
        isSeeded: true
      });
    }
    
    return categories;
  }

  static getDefaultAdmin() {
    return {
      firstName: 'Admin',
      lastName: 'User',
      email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@freakend.com',
      password: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123',
      role: 'admin',
      isActive: true,
      profile: {
        phone: '+1234567890',
        address: {
          street: '123 Admin Street',
          city: 'Admin City',
          state: 'Admin State',
          zipCode: '12345',
          country: 'Admin Country'
        }
      },
      preferences: {
        newsletter: true,
        notifications: true
      },
      isSeeded: true
    };
  }
}

module.exports = SeedDataGenerator;