const { validationResult } = require('express-validator');
const createError = require('http-errors');

// Example: Replace with your actual Mongoose model
const Item = require('../models/Item');

// Helper: sanitize and pick only allowed fields
const pickFields = (obj, allowed) =>
    allowed.reduce((acc, key) => (obj[key] !== undefined ? { ...acc, [key]: obj[key] } : acc), {});

// CREATE
exports.createItem = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return next(createError(400, 'Validation failed'));

        const data = pickFields(req.body, ['name', 'description', 'price']); // adjust fields
        const item = new Item(data);
        await item.save();
        res.status(201).json({ success: true, data: item });
    } catch (err) {
        next(err);
    }
};

// READ ALL
exports.getItems = async (req, res, next) => {
    try {
        const items = await Item.find().lean();
        res.json({ success: true, data: items });
    } catch (err) {
        next(err);
    }
};

// READ ONE
exports.getItem = async (req, res, next) => {
    try {
        const item = await Item.findById(req.params.id).lean();
        if (!item) return next(createError(404, 'Item not found'));
        res.json({ success: true, data: item });
    } catch (err) {
        next(err);
    }
};

// UPDATE
exports.updateItem = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return next(createError(400, 'Validation failed'));

        const data = pickFields(req.body, ['name', 'description', 'price']); // adjust fields
        const item = await Item.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
        if (!item) return next(createError(404, 'Item not found'));
        res.json({ success: true, data: item });
    } catch (err) {
        next(err);
    }
};

// DELETE
exports.deleteItem = async (req, res, next) => {
    try {
        const item = await Item.findByIdAndDelete(req.params.id);
        if (!item) return next(createError(404, 'Item not found'));
        res.json({ success: true, message: 'Item deleted' });
    } catch (err) {
        next(err);
    }
};

