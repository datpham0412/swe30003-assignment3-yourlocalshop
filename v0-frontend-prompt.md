# V0.dev Prompt: Shopping Cart & Order Management Frontend

## Project Context
Build a modern e-commerce frontend for a local shop system with Shopping Cart and Order Management features. The backend API is already implemented using ASP.NET Core with the following base URL: `http://localhost:5000`

## Authentication
All API endpoints require authentication via query parameters:
- `email`: User's email address
- `password`: User's password

User roles:
- **Customer**: Can manage their own cart and view their own orders
- **Admin**: Can view all orders and update order statuses

Store authenticated user credentials in React state/context for API calls.

---

## Feature 1: Shopping Cart Management

### User Stories
1. As a customer, I want to view my shopping cart with all items, quantities, prices, and totals
2. As a customer, I want to add products to my cart with a specified quantity
3. As a customer, I want to update the quantity of items in my cart
4. As a customer, I want to remove items from my cart
5. As a customer, I want to see real-time calculations of subtotal, tax (10%), and total

### API Endpoints

#### Get Cart
```
GET /api/ShoppingCart/list?email={email}&password={password}
Response:
{
  "cartId": 1,
  "items": [
    {
      "cartItemId": 1,
      "productId": 5,
      "name": "Product Name",
      "unitPrice": 29.99,
      "quantity": 2,
      "subtotal": 59.98
    }
  ],
  "subtotal": 59.98,
  "tax": 5.998,
  "total": 65.978
}
```

#### Add to Cart
```
POST /api/ShoppingCart/add?email={email}&password={password}
Body:
{
  "productId": 5,
  "quantity": 2
}
Response: Same as Get Cart
```

#### Update Cart Item
```
PUT /api/ShoppingCart/update?email={email}&password={password}
Body:
{
  "cartItemId": 1,
  "quantity": 3
}
Response: Same as Get Cart
```

#### Remove from Cart
```
DELETE /api/ShoppingCart/remove?email={email}&password={password}
Body:
{
  "cartItemId": 1
}
Response: Same as Get Cart
```

### UI Components Needed

**1. Shopping Cart Page** (`/cart`)
- Header: "Shopping Cart"
- Empty state: "Your cart is empty" message when no items
- Cart items list with:
  - Product name
  - Unit price (formatted as currency: $XX.XX)
  - Quantity input (number input with +/- buttons)
  - Subtotal per item
  - Remove button (trash icon)
- Cart summary card (sticky or fixed on right/bottom):
  - Subtotal: $XX.XX
  - Tax (10%): $XX.XX
  - Total: $XX.XX (bold, larger font)
  - "Proceed to Checkout" button
- Loading states during API calls
- Error handling with toast notifications

**2. Add to Cart Button Component** (for product pages)
- Quantity selector (default: 1)
- "Add to Cart" button
- Success feedback when item added
- Handles out-of-stock scenarios (shows error message)

### Design Guidelines
- Use a modern, clean design with cards/shadows
- Mobile-responsive layout
- Currency formatted as: $XX.XX (2 decimal places)
- Use icons for actions (trash for remove, +/- for quantity)
- Disabled state for buttons during API calls
- Color scheme: Primary (blue/green), Secondary (gray), Danger (red for remove)

---

## Feature 2: Order Management

### User Stories
1. As a customer, I want to create an order from my cart with shipping details
2. As a customer, I want to view my order history with status
3. As a customer, I want to view detailed information about a specific order
4. As an admin, I want to view all customer orders
5. As an admin, I want to update order statuses following proper workflow

### API Endpoints

#### Create Order
```
POST /api/Order/create?email={email}&password={password}
Body:
{
  "shipmentAddress": "123 Main St, City, State 12345",
  "contactName": "John Doe",
  "contactPhone": "555-1234",
  "note": "Leave at door" // optional
}
Response:
{
  "orderId": 1,
  "status": "PendingPayment",
  "createdAt": "2025-10-18T10:30:00Z",
  "lines": [
    {
      "productId": 5,
      "name": "Product Name",
      "unitPrice": 29.99,
      "quantity": 2,
      "lineTotal": 59.98
    }
  ],
  "subtotal": 59.98,
  "tax": 5.998,
  "total": 65.978,
  "shipmentAddress": "123 Main St, City, State 12345",
  "contactName": "John Doe",
  "contactPhone": "555-1234",
  "note": "Leave at door"
}
```

#### Get Customer Orders
```
GET /api/Order/list?email={email}&password={password}
Response: Array of Order objects (same structure as Create Order response)
```

#### Get Single Order
```
GET /api/Order/{id}?email={email}&password={password}
Response: Single Order object
```

#### Get All Orders (Admin Only)
```
GET /api/Order/all?email={email}&password={password}
Response: Array of Order objects
```

#### Update Order Status (Admin Only)
```
PUT /api/Order/status/{id}?email={email}&password={password}
Body:
{
  "status": "Paid" // or Processing, Packed, Shipped, Delivered, Failed, Cancelled
}
Response: Updated Order object
```

### Order Status Workflow
```
PendingPayment → Paid → Processing → Packed → Shipped → Delivered
                  ↓         ↓          ↓
                Failed   Failed    Failed

PendingPayment can also go to → Cancelled
```

**Status Display Colors:**
- PendingPayment: Yellow/Orange
- Paid: Light Blue
- Processing: Blue
- Packed: Purple
- Shipped: Indigo
- Delivered: Green
- Failed: Red
- Cancelled: Gray

### UI Components Needed

**1. Checkout Page** (`/checkout`)
- Cart summary (read-only view of items)
- Shipping information form:
  - Contact Name (required, text input)
  - Contact Phone (required, tel input)
  - Shipping Address (required, textarea)
  - Order Notes (optional, textarea)
- Order totals summary
- "Place Order" button
- Form validation
- Success redirect to order confirmation page

**2. Order History Page** (`/orders`) - Customer View
- Header: "My Orders"
- List of orders showing:
  - Order ID
  - Order Date (formatted: MMM DD, YYYY)
  - Status badge with color
  - Total amount
  - Number of items
  - "View Details" button
- Sort by date (newest first)
- Empty state: "No orders yet"

**3. Order Details Page** (`/orders/{id}`)
- Order information card:
  - Order ID, Date, Status badge
- Shipping details card:
  - Contact name, phone
  - Shipping address
  - Notes (if any)
- Order items table:
  - Product name
  - Unit price
  - Quantity
  - Line total
- Order summary:
  - Subtotal
  - Tax (10%)
  - Total
- "Back to Orders" button

**4. Admin Orders Dashboard** (`/admin/orders`) - Admin Only
- Header: "All Orders"
- Filterable/searchable orders table:
  - Order ID
  - Customer ID
  - Order Date
  - Status (with badge)
  - Total
  - Actions: "View" and "Update Status"
- Status filter dropdown (All, PendingPayment, Paid, etc.)
- Pagination if many orders

**5. Admin Order Status Update Modal**
- Current status display
- Status dropdown (only showing valid next states based on workflow)
- "Update Status" button
- Confirmation message
- Error handling for invalid transitions (backend will reject)

### Design Guidelines
- Use status badges with appropriate colors
- Format dates consistently (e.g., "Oct 18, 2025, 10:30 AM")
- Format currency as $XX.XX
- Responsive tables (stack on mobile)
- Loading skeletons for data fetching
- Toast notifications for success/error messages
- Breadcrumb navigation (e.g., Orders > Order #123)

---

## Technical Requirements

### State Management
- Use React hooks (useState, useEffect) or a state management library
- Maintain cart state globally (Context API or similar)
- Store auth credentials securely in state/context

### API Integration
- Use `fetch` or `axios` for HTTP requests
- Base URL: `http://localhost:5000`
- Include email and password as query parameters in all requests
- Handle loading states
- Handle errors gracefully with user-friendly messages
- Show toast notifications for success/error feedback

### Error Handling Examples
- "Product is out of stock" → Show error toast
- "Shopping cart is empty. Cannot create order." → Disable checkout button
- "Cannot mark as Paid from Processing status" → Show error in status update modal
- Network errors → "Unable to connect to server. Please try again."

### Routing
Suggested routes:
- `/cart` - Shopping Cart
- `/checkout` - Checkout form
- `/orders` - Customer order history
- `/orders/:id` - Order details
- `/admin/orders` - Admin orders dashboard (protect with role check)

### Form Validation
- Contact Name: Required, min 2 characters
- Contact Phone: Required, valid phone format
- Shipping Address: Required, min 10 characters
- Quantity: Min 1, max available stock (if displayed)

### Formatting Helpers
```javascript
// Currency formatting
const formatCurrency = (amount) => `$${amount.toFixed(2)}`;

// Date formatting
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
```

---

## Example API Call Pattern

```javascript
const fetchCart = async (email, password) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/ShoppingCart/list?email=${email}&password=${password}`
    );
    if (!response.ok) throw new Error('Failed to fetch cart');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

const addToCart = async (email, password, productId, quantity) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/ShoppingCart/add?email=${email}&password=${password}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity })
      }
    );
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};
```

---

## Design Inspiration
- Modern e-commerce platforms (Amazon, Shopify checkout)
- Clean, card-based layouts
- Use of white space
- Clear call-to-action buttons
- Status badges similar to order tracking UIs
- Mobile-first responsive design

## Additional Notes
- Assume user authentication is already handled (user is logged in)
- The backend automatically clamps quantities to available stock
- Tax rate is fixed at 10%
- One active cart per customer (backend enforces this)
- Backend enforces order status transition rules
- All decimal values should display 2 decimal places
- Use optimistic UI updates where appropriate (update UI before API response)

Generate modern, responsive React components with Tailwind CSS using these specifications.
