const MenuItem = require('../models/MenuItem');

// GET /api/menu - Get all menu items with optional filters
exports.getMenuItems = async (req, res) => {
  try {
    const { category, isAvailable, minPrice, maxPrice, page = 1, limit = 50 } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }
    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === 'true';
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = parseFloat(minPrice);
      if (maxPrice !== undefined) query.price.$lte = parseFloat(maxPrice);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([
      MenuItem.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      MenuItem.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/menu/search?q=query - Full-text search
exports.searchMenuItems = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.json({ success: true, data: [], count: 0 });
    }

    const sanitized = q.replace(/[<>"']/g, '').trim();

    // Use $or with $regex for broad matching (works without text index being built)
    const items = await MenuItem.find({
      $or: [
        { name: { $regex: sanitized, $options: 'i' } },
        { ingredients: { $regex: sanitized, $options: 'i' } },
        { description: { $regex: sanitized, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 }).limit(20);

    res.json({
      success: true,
      data: items,
      count: items.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/menu/:id - Get single menu item
exports.getMenuItemById = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid menu item ID' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/menu - Create new menu item
exports.createMenuItem = async (req, res) => {
  try {
    const { name, description, category, price, ingredients, isAvailable, preparationTime, imageUrl } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!category) {
      return res.status(400).json({ success: false, message: 'Category is required' });
    }
    if (price === undefined || price === null || isNaN(price)) {
      return res.status(400).json({ success: false, message: 'Price is required and must be a number' });
    }
    if (parseFloat(price) < 0) {
      return res.status(400).json({ success: false, message: 'Price must be non-negative' });
    }

    const validCategories = ['Appetizer', 'Main Course', 'Dessert', 'Beverage'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ success: false, message: 'Invalid category' });
    }

    // Check for duplicate name
    const existing = await MenuItem.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A menu item with this name already exists' });
    }

    const item = new MenuItem({
      name: name.trim(),
      description: description || '',
      category,
      price: parseFloat(price),
      ingredients: ingredients || [],
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      preparationTime: preparationTime || 0,
      imageUrl: imageUrl || ''
    });

    await item.save();

    res.status(201).json({ success: true, data: item, message: 'Menu item created successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'A menu item with this name already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/menu/:id - Update menu item
exports.updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.price !== undefined && parseFloat(updates.price) < 0) {
      return res.status(400).json({ success: false, message: 'Price must be non-negative' });
    }

    if (updates.category) {
      const validCategories = ['Appetizer', 'Main Course', 'Dessert', 'Beverage'];
      if (!validCategories.includes(updates.category)) {
        return res.status(400).json({ success: false, message: 'Invalid category' });
      }
    }

    // Check for duplicate name if name is being changed
    if (updates.name) {
      const existing = await MenuItem.findOne({ name: updates.name.trim(), _id: { $ne: id } });
      if (existing) {
        return res.status(409).json({ success: false, message: 'A menu item with this name already exists' });
      }
      updates.name = updates.name.trim();
    }

    const item = await MenuItem.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    res.json({ success: true, data: item, message: 'Menu item updated successfully' });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid menu item ID' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/menu/:id - Delete menu item
exports.deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    res.json({ success: true, message: 'Menu item deleted successfully' });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid menu item ID' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/menu/:id/availability - Toggle availability
exports.toggleAvailability = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    item.isAvailable = !item.isAvailable;
    await item.save();

    res.json({ success: true, data: item, message: `Menu item is now ${item.isAvailable ? 'available' : 'unavailable'}` });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid menu item ID' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};
