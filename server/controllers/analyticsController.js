const Order = require('../models/Order');

// GET /api/analytics/top-sellers - Top 5 selling menu items via aggregation
exports.getTopSellers = async (req, res) => {
  try {
    const topSellers = await Order.aggregate([
      // Only count non-cancelled orders
      { $match: { status: { $ne: 'Cancelled' } } },
      // Flatten the items array — each item becomes its own document
      { $unwind: '$items' },
      // Group by menuItem ID and sum quantities
      {
        $group: {
          _id: '$items.menuItem',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orderCount: { $sum: 1 }
        }
      },
      // Join with MenuItem collection to get details
      {
        $lookup: {
          from: 'menuitems',
          localField: '_id',
          foreignField: '_id',
          as: 'menuItemDetails'
        }
      },
      // Flatten the lookup array (one-to-one)
      { $unwind: '$menuItemDetails' },
      // Reshape the output
      {
        $project: {
          _id: 0,
          menuItemId: '$_id',
          name: '$menuItemDetails.name',
          category: '$menuItemDetails.category',
          price: '$menuItemDetails.price',
          imageUrl: '$menuItemDetails.imageUrl',
          isAvailable: '$menuItemDetails.isAvailable',
          totalQuantity: 1,
          totalRevenue: { $round: ['$totalRevenue', 2] },
          orderCount: 1
        }
      },
      // Sort by total quantity sold descending
      { $sort: { totalQuantity: -1 } },
      // Limit to top 5
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: topSellers,
      count: topSellers.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/analytics/summary - Order summary stats
exports.getSummary = async (req, res) => {
  try {
    const summary = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const totalOrders = summary.reduce((sum, s) => sum + s.count, 0);
    const totalRevenue = summary.reduce((sum, s) => sum + s.totalRevenue, 0);

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        byStatus: summary.map(s => ({
          status: s._id,
          count: s.count,
          revenue: parseFloat(s.totalRevenue.toFixed(2))
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
