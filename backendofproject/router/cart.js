const express=require("express")
const router=express.Router()
const {authMiddleware}=require("../authmiddleware")
const {User,Food_item_list,Order,Admin,Cart}=require("../db");
// cart.js route

router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { food, quantity, halforfull } = req.body;

    // validate food item
    const foodItem = await Food_item_list.findById(food);
    if (!foodItem) {
      return res.status(404).json({ message: "Food item not found" });
    }

    // find user's cart
    let cart = await Cart.findOne({ user: req.userId });

    if (!cart) {
      // if no cart, create a new one
      cart = new Cart({
        user: req.userId,
        items: [{ food, quantity, halforfull }],
      });
    } else {
      // if cart exists, check if food already in items (same food + same halforfull)
      const existingItemIndex = cart.items.findIndex(
        (item) => item.food.toString() === food && item.half_or_full === halforfull
      );

      if (existingItemIndex > -1) {
        // food already in cart with same size → update quantity
        cart.items[existingItemIndex].quantity += quantity || 1;
      } else {
        // add new item
        cart.items.push({ food, quantity, halforfull });
      }

      cart.updatedAt = Date.now();
    }

    await cart.save();
    res.status(200).json({ message: "Item added to cart", cart });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/remove", authMiddleware, async (req, res) => {
  try {
    const { food, halforfull } = req.body;

    let cart = await Cart.findOne({ user: req.userId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Find index of item with same food + halforfull
    const itemIndex = cart.items.findIndex(
      (item) => item.food.toString() === food && item.halforfull === halforfull
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Remove it
    cart.items.splice(itemIndex, 1);
    cart.updatedAt = Date.now();
    await cart.save();

    res.status(200).json({ message: "Item removed from cart", cart });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/view", authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId }).populate("items.food");

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({ message: "Cart is empty", cart: [] });
    }

    // Build response with price info
    const cartDetails = cart.items.map((item) => {
      const price =
        item.halforfull === "half"
          ? item.food.prices[0]
          : item.food.prices[1];

      return {
        foodId: item.food._id,
        itemName: item.food.itemName,
        category: item.food.category,
        subCategory: item.food.subCategory,
        halforfull: item.halforfull,
        unitPrice: price,
        quantity: item.quantity,
        total: price * item.quantity,
      };
    });

    res.status(200).json({ cart: cartDetails });
  } catch (error) {
    console.error("Error viewing cart:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/checkout", authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId }).populate("items.food");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Calculate total price
    let totalAmount = 0;
    cart.items.forEach((item) => {
      if (item.food && item.food.prices && item.food.prices.length > 0) {
        const price =
          item.halforfull === "half"
            ? item.food.prices[0]
            : item.food.prices[1];
        totalAmount += price * item.quantity;
      }
    });

    // Clear cart after checkout
    cart.items = [];
    cart.updatedAt = Date.now();
    await cart.save();

    res.status(200).json({
      message: "Checkout successful, order placed!",
      totalAmount,
    });
  } catch (error) {
    console.error("Error during checkout:", error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports=router