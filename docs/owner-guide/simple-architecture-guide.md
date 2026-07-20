# Simple Architecture & Plain English Guide

This guide explains how XINVORA works under the hood without complicated programming terminology.

---

## 1. What happens when someone clicks "Add to Cart"?
1. **Selection Check**: The website checks if the customer selected a color and size.
2. **Stock Verification**: The server verifies that the chosen size has inventory available in the database.
3. **Cart Storage**:
   - If the customer is **guest**, the item is saved into a secure browser cookie (`cart_session`).
   - If the customer is **logged in**, the item is saved directly to their account in the database.
4. **Visual Feedback**: The shopping cart drawer slides open, displaying the updated item count, total price, original price strikethroughs, and discount badges.

---

## 2. What happens after Checkout?
1. **Order Creation**: A new order record is created in the database with a unique order number (e.g. `XIN-10042`).
2. **Inventory Deduction**: The purchased items are subtracted from live stock counts.
3. **Cart Reset**: The customer's cart is cleared.
4. **Admin Alert**: The order immediately appears on the Admin Dashboard under Pending Orders.

---

## 3. How does a guest user become a logged-in user?
1. **Login Event**: The customer enters their email and password.
2. **Cart Merge**: Any items the customer added to their cart as a guest are automatically merged into their saved account cart.
3. **Privacy Sync**: Their cookie privacy preferences are automatically saved into their account profile in the database.

---

## 4. How does the Cookie Banner work?
1. **First Visit**: When a new customer lands on XINVORA, a floating luxury banner appears asking for cookie consent.
2. **Signed Cookie**: When the user clicks "Accept All" or customizes settings, an encrypted signed cookie (`xinvora-consent`) is saved in their browser.
3. **Script Gatekeeper**: Analytics tools (like Google Analytics or Meta Pixel) are blocked from running until the customer explicitly grants permission.

---

**Last Updated**: July 20, 2026
