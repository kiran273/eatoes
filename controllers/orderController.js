const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

// GET /api/orders - Get all orders with pagination and status filtering
exports.getOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) {
      const validStatuses = ['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status filter' });
      }
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('items.menuItem', 'name category price imageUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: orders,
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

// GET /api/orders/:id - Get single order with populated menu items
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.menuItem', 'name category price imageUrl description');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/orders - Create new order
exports.createOrder = async (req, res) => {
  try {
    const { items, customerName, tableNumber } = req.body;

    // Validation
    if (!customerName || !customerName.trim()) {
      return res.status(400).json({ success: false, message: 'Customer name is required' });
    }
    if (!tableNumber || tableNumber < 1) {
      return res.status(400).json({ success: false, message: 'Valid table number is required' });
    }
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item' });
    }

    // Validate each item and calculate total
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      if (!item.menuItem || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ success: false, message: 'Each item must have a valid menuItem ID and quantity >= 1' });
      }

      const menuItem = await MenuItem.findById(item.menuItem);
      if (!menuItem) {
        return res.status(400).json({ success: false, message: `Menu item ${item.menuItem} not found` });
      }
      if (!menuItem.isAvailable) {
        return res.status(400).json({ success: false, message: `"${menuItem.name}" is currently unavailable` });
      }

      const itemPrice = menuItem.price;
      totalAmount += itemPrice * item.quantity;

      validatedItems.push({
        menuItem: menuItem._id,
        quantity: item.quantity,
        price: itemPrice
      });
    }

    const order = new Order({
      items: validatedItems,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      customerName: customerName.trim(),
      tableNumber: parseInt(tableNumber),
      status: 'Pending'
    });

    await order.save();

    // Populate for response
    await order.populate('items.menuItem', 'name category price imageUrl');

    res.status(201).json({ success: true, data: order, message: 'Order created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/orders/:id/status - Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Valid status is required' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Validate status transitions
    const validTransitions = {
      'Pending': ['Preparing', 'Cancelled'],
      'Preparing': ['Ready', 'Cancelled'],
      'Ready': ['Delivered'],
      'Delivered': [],
      'Cancelled': []
    };

    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from "${order.status}" to "${status}". Valid transitions: ${validTransitions[order.status].join(', ') || 'none'}`
      });
    }

    order.status = status;
    await order.save();

    await order.populate('items.menuItem', 'name category price imageUrl');

    res.json({ success: true, data: order, message: `Order status updated to "${status}"` });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};
