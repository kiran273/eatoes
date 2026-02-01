const mongoose = require('mongoose');
const dotenv = require('dotenv');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB for seeding');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
};

const menuItems = [
  // Appetizers
  {
    name: 'Bruschetta',
    description: 'Classic Italian bruschetta with tomatoes, basil, and garlic on toasted bread',
    category: 'Appetizer',
    price: 8.99,
    ingredients: ['bread', 'tomatoes', 'basil', 'garlic', 'olive oil', 'balsamic glaze'],
    isAvailable: true,
    preparationTime: 10,
    imageUrl: 'https://images.unsplash.com/photo-1608444885842-70dd730ad08e?w=400&q=80'
  },
  {
    name: 'Crispy Calamari',
    description: 'Lightly battered and fried calamari rings served with marinara sauce',
    category: 'Appetizer',
    price: 11.99,
    ingredients: ['calamari', 'flour', 'egg', 'breadcrumbs', 'marinara sauce', 'lemon'],
    isAvailable: true,
    preparationTime: 12,
    imageUrl: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400&q=80'
  },
  {
    name: 'Spinach Artichoke Dip',
    description: 'Creamy blend of spinach and artichokes with melted cheese, served with tortilla chips',
    category: 'Appetizer',
    price: 9.49,
    ingredients: ['spinach', 'artichoke hearts', 'cream cheese', 'mozzarella', 'parmesan', 'tortilla chips'],
    isAvailable: true,
    preparationTime: 15,
    imageUrl: 'https://images.unsplash.com/photo-1511192336210-c87d4ffa35d3?w=400&q=80'
  },
  {
    name: 'Garlic Bread',
    description: 'Freshly baked garlic bread with herb butter and a side of tomato dipping sauce',
    category: 'Appetizer',
    price: 6.99,
    ingredients: ['baguette', 'butter', 'garlic', 'parsley', 'mozzarella'],
    isAvailable: true,
    preparationTime: 8,
    imageUrl: 'https://images.unsplash.com/photo-1588137391932-40dc74f8911d?w=400&q=80'
  },

  // Main Courses
  {
    name: 'Grilled Salmon',
    description: 'Atlantic salmon fillet grilled to perfection, served with asparagus and lemon butter sauce',
    category: 'Main Course',
    price: 24.99,
    ingredients: ['salmon fillet', 'asparagus', 'lemon', 'butter', 'dill', 'garlic', 'olive oil'],
    isAvailable: true,
    preparationTime: 20,
    imageUrl: 'https://images.unsplash.com/photo-1532030773152-ea60888f28a4?w=400&q=80'
  },
  {
    name: 'Chicken Parmesan',
    description: 'Breaded chicken breast topped with marinara sauce and melted mozzarella, served with spaghetti',
    category: 'Main Course',
    price: 18.99,
    ingredients: ['chicken breast', 'breadcrumbs', 'marinara sauce', 'mozzarella', 'parmesan', 'spaghetti', 'basil'],
    isAvailable: true,
    preparationTime: 25,
    imageUrl: 'https://images.unsplash.com/photo-1603813031413-59f25da082ac?w=400&q=80'
  },
  {
    name: 'Ribeye Steak',
    description: '12oz prime ribeye steak with truffle mashed potatoes and red wine reduction',
    category: 'Main Course',
    price: 32.99,
    ingredients: ['ribeye steak', 'potatoes', 'truffle oil', 'butter', 'red wine', 'rosemary', 'garlic'],
    isAvailable: true,
    preparationTime: 30,
    imageUrl: 'https://images.unsplash.com/photo-1558030185-a5bc47da3e58?w=400&q=80'
  },
  {
    name: 'Mushroom Risotto',
    description: 'Creamy Arborio rice with wild mushrooms, parmesan, and fresh herbs',
    category: 'Main Course',
    price: 16.99,
    ingredients: ['Arborio rice', 'wild mushrooms', 'parmesan', 'white wine', 'vegetable broth', 'onion', 'thyme'],
    isAvailable: false,
    preparationTime: 35,
    imageUrl: 'https://images.unsplash.com/photo-1476718376589-a035098a4716?w=400&q=80'
  },
  {
    name: 'BBQ Bacon Burger',
    description: 'Juicy beef patty with crispy bacon, cheddar cheese, BBQ sauce, and caramelized onions',
    category: 'Main Course',
    price: 14.99,
    ingredients: ['ground beef', 'bacon', 'cheddar cheese', 'BBQ sauce', 'onions', 'lettuce', 'tomato', 'brioche bun'],
    isAvailable: true,
    preparationTime: 18,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80'
  },

  // Desserts
  {
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with a molten center, served with vanilla ice cream',
    category: 'Dessert',
    price: 10.99,
    ingredients: ['dark chocolate', 'butter', 'eggs', 'sugar', 'flour', 'vanilla ice cream'],
    isAvailable: true,
    preparationTime: 12,
    imageUrl: 'https://images.unsplash.com/photo-1535556375547-4753954b42f7?w=400&q=80'
  },
  {
    name: 'Tiramisu',
    description: 'Classic Italian tiramisu with layers of espresso-soaked ladyfingers and mascarpone cream',
    category: 'Dessert',
    price: 9.99,
    ingredients: ['mascarpone', 'ladyfingers', 'espresso', 'cocoa powder', 'egg yolks', 'sugar', 'heavy cream'],
    isAvailable: true,
    preparationTime: 5,
    imageUrl: 'https://images.unsplash.com/photo-1609461135649-76094fbe4d72?w=400&q=80'
  },
  {
    name: 'New York Cheesecake',
    description: 'Rich and creamy New York-style cheesecake with a graham cracker crust and berry compote',
    category: 'Dessert',
    price: 8.99,
    ingredients: ['cream cheese', 'graham crackers', 'butter', 'sugar', 'vanilla', 'sour cream', 'mixed berries'],
    isAvailable: true,
    preparationTime: 8,
    imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80'
  },

  // Beverages
  {
    name: 'Fresh Lemonade',
    description: 'Freshly squeezed lemons blended with water, sugar, and a hint of mint',
    category: 'Beverage',
    price: 4.99,
    ingredients: ['lemons', 'water', 'sugar', 'mint', 'ice'],
    isAvailable: true,
    preparationTime: 3,
    imageUrl: 'https://images.unsplash.com/photo-1609722797013-3a35506cbe0d?w=400&q=80'
  },
  {
    name: 'Iced Matcha Latte',
    description: 'Premium ceremonial grade matcha blended with oat milk and served over ice',
    category: 'Beverage',
    price: 5.99,
    ingredients: ['matcha powder', 'oat milk', 'ice', 'honey', 'vanilla'],
    isAvailable: true,
    preparationTime: 4,
    imageUrl: 'https://images.unsplash.com/photo-1552627549-9443e0e94e35?w=400&q=80'
  },
  {
    name: 'Virgin Mojito',
    description: 'Classic mojito without alcohol — lime, mint, sugar, and sparkling water',
    category: 'Beverage',
    price: 5.49,
    ingredients: ['lime', 'fresh mint', 'sugar', 'sparkling water', 'ice'],
    isAvailable: true,
    preparationTime: 3,
    imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80'
  }
];

const seed = async () => {
  await connectDB();

  try {
    // Clear existing data
    await MenuItem.deleteMany({});
    await Order.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert menu items
    const createdItems = await MenuItem.insertMany(menuItems);
    console.log(`✅ Inserted ${createdItems.length} menu items`);

    // Build a map of name -> _id for easy reference
    const itemMap = {};
    createdItems.forEach(item => {
      itemMap[item.name] = item._id;
    });

    // Create 10 sample orders
    const sampleOrders = [
      {
        items: [
          { menuItem: itemMap['Bruschetta'], quantity: 2, price: 8.99 },
          { menuItem: itemMap['Grilled Salmon'], quantity: 1, price: 24.99 },
          { menuItem: itemMap['Fresh Lemonade'], quantity: 2, price: 4.99 }
        ],
        totalAmount: 53.95,
        status: 'Delivered',
        customerName: 'Alice Johnson',
        tableNumber: 3
      },
      {
        items: [
          { menuItem: itemMap['Chicken Parmesan'], quantity: 2, price: 18.99 },
          { menuItem: itemMap['Garlic Bread'], quantity: 1, price: 6.99 },
          { menuItem: itemMap['Tiramisu'], quantity: 2, price: 9.99 }
        ],
        totalAmount: 74.95,
        status: 'Preparing',
        customerName: 'Bob Smith',
        tableNumber: 7
      },
      {
        items: [
          { menuItem: itemMap['Ribeye Steak'], quantity: 1, price: 32.99 },
          { menuItem: itemMap['Crispy Calamari'], quantity: 1, price: 11.99 },
          { menuItem: itemMap['Iced Matcha Latte'], quantity: 1, price: 5.99 }
        ],
        totalAmount: 50.97,
        status: 'Ready',
        customerName: 'Charlie Brown',
        tableNumber: 1
      },
      {
        items: [
          { menuItem: itemMap['Spinach Artichoke Dip'], quantity: 1, price: 9.49 },
          { menuItem: itemMap['BBQ Bacon Burger'], quantity: 2, price: 14.99 },
          { menuItem: itemMap['Virgin Mojito'], quantity: 2, price: 5.49 }
        ],
        totalAmount: 60.45,
        status: 'Pending',
        customerName: 'Diana Prince',
        tableNumber: 5
      },
      {
        items: [
          { menuItem: itemMap['Chocolate Lava Cake'], quantity: 3, price: 10.99 },
          { menuItem: itemMap['Fresh Lemonade'], quantity: 3, price: 4.99 }
        ],
        totalAmount: 47.94,
        status: 'Cancelled',
        customerName: 'Eve Wilson',
        tableNumber: 2
      },
      {
        items: [
          { menuItem: itemMap['Grilled Salmon'], quantity: 2, price: 24.99 },
          { menuItem: itemMap['New York Cheesecake'], quantity: 1, price: 8.99 },
          { menuItem: itemMap['Iced Matcha Latte'], quantity: 2, price: 5.99 }
        ],
        totalAmount: 76.94,
        status: 'Delivered',
        customerName: 'Frank Castle',
        tableNumber: 4
      },
      {
        items: [
          { menuItem: itemMap['Garlic Bread'], quantity: 2, price: 6.99 },
          { menuItem: itemMap['Chicken Parmesan'], quantity: 1, price: 18.99 },
          { menuItem: itemMap['Virgin Mojito'], quantity: 1, price: 5.49 }
        ],
        totalAmount: 38.46,
        status: 'Preparing',
        customerName: 'Grace Hopper',
        tableNumber: 8
      },
      {
        items: [
          { menuItem: itemMap['BBQ Bacon Burger'], quantity: 3, price: 14.99 },
          { menuItem: itemMap['Crispy Calamari'], quantity: 2, price: 11.99 },
          { menuItem: itemMap['Fresh Lemonade'], quantity: 3, price: 4.99 }
        ],
        totalAmount: 83.94,
        status: 'Pending',
        customerName: 'Henry Ford',
        tableNumber: 6
      },
      {
        items: [
          { menuItem: itemMap['Tiramisu'], quantity: 2, price: 9.99 },
          { menuItem: itemMap['Bruschetta'], quantity: 1, price: 8.99 },
          { menuItem: itemMap['Ribeye Steak'], quantity: 1, price: 32.99 }
        ],
        totalAmount: 61.96,
        status: 'Ready',
        customerName: 'Ivy Chen',
        tableNumber: 9
      },
      {
        items: [
          { menuItem: itemMap['Spinach Artichoke Dip'], quantity: 2, price: 9.49 },
          { menuItem: itemMap['Chocolate Lava Cake'], quantity: 2, price: 10.99 },
          { menuItem: itemMap['Iced Matcha Latte'], quantity: 1, price: 5.99 }
        ],
        totalAmount: 56.95,
        status: 'Delivered',
        customerName: 'Jack Ryan',
        tableNumber: 10
      }
    ];

    const createdOrders = await Order.insertMany(sampleOrders);
    console.log(`✅ Inserted ${createdOrders.length} sample orders`);
    console.log('\n🎉 Seed complete! Database is ready.');

  } catch (error) {
    console.error('❌ Seed error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔒 Disconnected from MongoDB');
  }
};

seed();
