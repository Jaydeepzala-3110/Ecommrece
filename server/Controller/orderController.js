const Order = require("../models/orderModel")
const Product = require("../models/productModel")
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors")


// Create a new order
exports.createOrder = catchAsyncErrors(async (req, res, next) => {
    const {
        orderItems,
        paymentInfo,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
    } = req.body;

    const order = await new Order({
        user: req.user._id,
        orderItems,
        paymentInfo,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now()
    });

    const createdOrder = await order.save();

    res.status(201).json({
        success: true,
        order: createdOrder
    });
});


// Get single order

exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
    const orderId = req.params.id;

    const order = await Order.findById(orderId).populate("user", "name email");

    if (!order) {
        return next(new ErrorHandler("Order not found", 404));
    }

    res.status(200).json({
        success: true,
        order
    });
});

// Get my orders --Logged in user

exports.getMyOrders = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user._id;

    const orders = await Order.find({ user: userId });

    const orderCount = orders.length;

    res.status(200).json({
        success: true,
        orderCount,
        orders
    });
});


// Get all order --Admin

exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find()

    let totalAmount = 0;

    orders.forEach((order) => {
        totalAmount += order.totalPrice;
    })

    res.status(200).json({
        success: true,
        totalAmount,
        orders,
    });
});

// Update order Status
exports.updateOrderStatus = catchAsyncErrors(async (req, res, next) => {
    const orderId = req.params.id;

    const order = await Order.findById(orderId);

    if (!order) {
        return next(new ErrorHandler("Order not found", 404));
    }

    if (order.orderStatus === "Delivered") {
        return next(new ErrorHandler("This order has already been delivered", 400));
    }

    order.orderItems.forEach(async (orderItem) => {
        await updateStock(orderItem.product, orderItem.quantity);
    });

    order.orderStatus = req.body.status;

    if (req.body.status === "Delivered") {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        await updateProductStock(order.orderItems);
    }

    await order.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: "Order status updated successfully",
    });
});
async function updateStock(productId, quantity) {
    const product = await Product.findById(productId);

    if (product) {
        product.stock -= quantity;
        await product.save({ validateBeforeSave: false });
    }
}

async function updateProductStock(orderItems) {
    for (const orderItem of orderItems) {
        const product = await Product.findById(orderItem.product);
        if (product) {
            product.stock -= orderItem.quantity;
            await product.save({ validateBeforeSave: false });
        }
    }
}



exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
    const orderId = req.params.id;

    const order = await Order.deleteOne({_id: orderId});

    if (order.deletedCount === 0) {
        return next(new ErrorHandler("Order not found", 404));
    }

    res.status(200).json({
        success: true,
        message: "Order deleted successfully",
    });
});




