const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// GET /api/menu - Get all menu items (with filters)
router.get('/', menuController.getMenuItems);

// GET /api/menu/search - Search menu items
router.get('/search', menuController.searchMenuItems);

// GET /api/menu/:id - Get single menu item
router.get('/:id', menuController.getMenuItemById);

// POST /api/menu - Create menu item
router.post('/', menuController.createMenuItem);

// PUT /api/menu/:id - Update menu item
router.put('/:id', menuController.updateMenuItem);

// DELETE /api/menu/:id - Delete menu item
router.delete('/:id', menuController.deleteMenuItem);

// PATCH /api/menu/:id/availability - Toggle availability
router.patch('/:id/availability', menuController.toggleAvailability);

module.exports = router;
