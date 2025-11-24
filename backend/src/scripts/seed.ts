import dotenv from 'dotenv';
dotenv.config();
import connectDB from '../config/database';
import User from '../models/User';
import Category from '../models/Category';
import Product from '../models/Product';
import Order from '../models/Order';

dotenv.config();

const categories = [
  {
    name: 'Electronics',
    description: 'Latest electronic devices and gadgets',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800',
    isActive: true
  },
  {
    name: 'Fashion',
    description: 'Trendy clothing and accessories',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800',
    isActive: true
  },
  {
    name: 'Home & Garden',
    description: 'Everything for your home and garden',
    image: 'https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=800',
    isActive: true
  },
  {
    name: 'Sports & Outdoors',
    description: 'Sports equipment and outdoor gear',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
    isActive: true
  },
  {
    name: 'Books',
    description: 'Wide selection of books and e-books',
    image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800',
    isActive: true
  }
];

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});

    // Create admin user
    console.log('Creating admin user...');
    const admin = await User.create({
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@playable.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: 'admin',
      phone: '+90 555 123 4567'
    });

    // Create customer users
    console.log('Creating customer users...');
    const customer1 = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'customer',
      phone: '+90 555 234 5678',
      addresses: [
        {
          street: '123 Main St',
          city: 'Istanbul',
          state: 'Istanbul',
          zipCode: '34000',
          country: 'Turkey',
          isDefault: true
        }
      ]
    });

    const customer2 = await User.create({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password123',
      role: 'customer',
      phone: '+90 555 345 6789',
      addresses: [
        {
          street: '456 Oak Ave',
          city: 'Ankara',
          state: 'Ankara',
          zipCode: '06000',
          country: 'Turkey',
          isDefault: true
        }
      ]
    });

    // Create categories
    console.log('Creating categories...');
    try {
  await Category.collection.dropIndex('slug_1');
  console.log('Dropped old slug index');
} catch (error) {
  // Index doesn't exist, that's fine
}
    const createdCategories = await Category.insertMany(categories);

    // Create products
    console.log('Creating products...');
    try {
  await Product.collection.dropIndex('slug_1');
  console.log('Dropped old product slug index');
} catch (error) {
  // Index doesn't exist, that's fine
}
    const products = [];

    // Electronics products
    for (let i = 1; i <= 15; i++) {
      products.push({
        name: `Electronics Product ${i}`,
        description: `High-quality electronics product with amazing features. Product ${i} offers great value for money and comes with warranty.`,
        price: Math.floor(Math.random() * 2000) + 500,
        compareAtPrice: Math.floor(Math.random() * 3000) + 1500,
        category: createdCategories[0]._id,
        images: [
          `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80`,
          `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80`
        ],
        stock: Math.floor(Math.random() * 100) + 10,
        sku: `ELEC-${i.toString().padStart(4, '0')}`,
        specifications: [
          { key: 'Brand', value: 'TechBrand' },
          { key: 'Warranty', value: '2 Years' },
          { key: 'Color', value: ['Black', 'White', 'Silver'][i % 3] }
        ],
        averageRating: Math.floor(Math.random() * 2) + 3.5,
        totalReviews: Math.floor(Math.random() * 50),
        totalOrders: Math.floor(Math.random() * 100),
        isActive: true,
        isFeatured: i <= 4
      });
    }

    // Fashion products
    for (let i = 1; i <= 15; i++) {
      products.push({
        name: `Fashion Item ${i}`,
        description: `Stylish fashion product perfect for any occasion. Item ${i} is made from premium materials and offers exceptional comfort.`,
        price: Math.floor(Math.random() * 500) + 100,
        compareAtPrice: Math.floor(Math.random() * 800) + 300,
        category: createdCategories[1]._id,
        images: [
          `https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80`,
          `https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=800&q=80`
        ],
        stock: Math.floor(Math.random() * 100) + 10,
        sku: `FASH-${i.toString().padStart(4, '0')}`,
        specifications: [
          { key: 'Material', value: 'Cotton' },
          { key: 'Size', value: ['S', 'M', 'L', 'XL'][i % 4] },
          { key: 'Care', value: 'Machine Washable' }
        ],
        averageRating: Math.floor(Math.random() * 2) + 3,
        totalReviews: Math.floor(Math.random() * 40),
        totalOrders: Math.floor(Math.random() * 80),
        isActive: true,
        isFeatured: i <= 3
      });
    }

    // Home & Garden products
    for (let i = 1; i <= 12; i++) {
      products.push({
        name: `Home Product ${i}`,
        description: `Essential home product that adds value to your living space. Product ${i} combines functionality with style.`,
        price: Math.floor(Math.random() * 1000) + 200,
        compareAtPrice: Math.floor(Math.random() * 1500) + 500,
        category: createdCategories[2]._id,
        images: [
          `https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80`,
          `https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80`
        ],
        stock: Math.floor(Math.random() * 50) + 5,
        sku: `HOME-${i.toString().padStart(4, '0')}`,
        specifications: [
          { key: 'Material', value: 'Wood' },
          { key: 'Dimensions', value: '120x80x45 cm' }
        ],
        averageRating: Math.floor(Math.random() * 1.5) + 3.5,
        totalReviews: Math.floor(Math.random() * 30),
        totalOrders: Math.floor(Math.random() * 60),
        isActive: true,
        isFeatured: i <= 2
      });
    }

    // Sports products
    for (let i = 1; i <= 10; i++) {
      products.push({
        name: `Sports Equipment ${i}`,
        description: `Professional sports equipment for athletes and enthusiasts. Equipment ${i} meets international standards.`,
        price: Math.floor(Math.random() * 800) + 150,
        category: createdCategories[3]._id,
        images: [
          `https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80`
        ],
        stock: Math.floor(Math.random() * 80) + 10,
        sku: `SPORT-${i.toString().padStart(4, '0')}`,
        specifications: [
          { key: 'Type', value: 'Professional' },
          { key: 'Weight', value: '2.5 kg' }
        ],
        averageRating: Math.floor(Math.random() * 1) + 4,
        totalReviews: Math.floor(Math.random() * 25),
        totalOrders: Math.floor(Math.random() * 50),
        isActive: true,
        isFeatured: i <= 2
      });
    }

    // Books
    for (let i = 1; i <= 8; i++) {
      products.push({
        name: `Book Title ${i}`,
        description: `Fascinating book that will keep you engaged from start to finish. Book ${i} is a must-read for enthusiasts.`,
        price: Math.floor(Math.random() * 100) + 50,
        category: createdCategories[4]._id,
        images: [
          `https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80`
        ],
        stock: Math.floor(Math.random() * 200) + 20,
        sku: `BOOK-${i.toString().padStart(4, '0')}`,
        specifications: [
          { key: 'Author', value: 'Famous Author' },
          { key: 'Pages', value: '350' },
          { key: 'Language', value: 'English' }
        ],
        averageRating: Math.floor(Math.random() * 1) + 4,
        totalReviews: Math.floor(Math.random() * 100),
        totalOrders: Math.floor(Math.random() * 150),
        isActive: true,
        isFeatured: i <= 2
      });
    }

    const createdProducts = await Product.insertMany(products);

    // Create sample orders
    console.log('Creating sample orders...');
    await Order.create({
      user: customer1._id,
      items: [
        {
          product: createdProducts[0]._id,
          productName: createdProducts[0].name,
          productImage: createdProducts[0].images[0],
          quantity: 2,
          price: createdProducts[0].price,
          total: createdProducts[0].price * 2
        }
      ],
      shippingAddress: customer1.addresses[0],
      paymentMethod: 'credit_card',
      paymentStatus: 'paid',
      orderStatus: 'delivered',
      subtotal: createdProducts[0].price * 2,
      tax: (createdProducts[0].price * 2) * 0.18,
      shippingCost: 0,
      total: (createdProducts[0].price * 2) * 1.18
    });

    await Order.create({
      user: customer2._id,
      items: [
        {
          product: createdProducts[5]._id,
          productName: createdProducts[5].name,
          productImage: createdProducts[5].images[0],
          quantity: 1,
          price: createdProducts[5].price,
          total: createdProducts[5].price
        }
      ],
      shippingAddress: customer2.addresses[0],
      paymentMethod: 'debit_card',
      paymentStatus: 'paid',
      orderStatus: 'processing',
      subtotal: createdProducts[5].price,
      tax: createdProducts[5].price * 0.18,
      shippingCost: 50,
      total: (createdProducts[5].price * 1.18) + 50
    });

    console.log('✅ Database seeded successfully!');
    console.log('\n📝 Demo Accounts:');
    console.log('Admin:');
    console.log(`  Email: ${admin.email}`);
    console.log(`  Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
    console.log('\nCustomer 1:');
    console.log(`  Email: ${customer1.email}`);
    console.log('  Password: password123');
    console.log('\nCustomer 2:');
    console.log(`  Email: ${customer2.email}`);
    console.log('  Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();