
# 🛍️ E-Commerce Clothing Store (MERN Stack)

A full-featured clothing e-commerce web application built using the MERN stack (MongoDB, Express.js, React, Node.js). This app supports product browsing, cart, checkout, user authentication, admin management, payments via Stripe, and more!

## 🚀 Live Demo

- **Frontend (Vercel)**: [https://ecommerce-clothing.vercel.app](https://ecommerce-clothing.vercel.app)
- **Backend (Render)**: [https://ecommerce-clothing.onrender.com](https://ecommerce-clothing.onrender.com)

---

## 📁 Project Structure

```
ecommerce-clothing/
├── backend/               # Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── utils/
│   ├── server.js
│   └── .env
└── frontend/              # React frontend
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── App.js
    └── .env
```

---

## 🧰 Tech Stack

- **Frontend**: React.js, Axios, React Router, Context API
- **Backend**: Node.js, Express.js, Mongoose
- **Database**: MongoDB Atlas
- **Authentication**: JWT + bcrypt
- **Payments**: Stripe
- **Image Uploads**: Cloudinary / Local
- **Deployment**: Frontend on **Vercel**, Backend on **Render**

---

## 🛠️ Getting Started (Local Development)

### 1. Clone the Repository

```bash
git clone https://github.com/Sahanaa21/ecommerce-clothing.git
cd ecommerce-clothing
```

---

### 2. Setup Backend

```bash
cd backend
npm install
```

#### 🔐 Create `.env` file inside `backend/`

```env
PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
STRIPE_SECRET_KEY=your_stripe_secret
FRONTEND_URL=http://localhost:3000
```

---

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

#### 🌐 Create `.env` file inside `frontend/`

```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

---

### 4. Run Both Servers

- Start backend:
  ```bash
  cd backend
  npm run dev
  ```

- Start frontend (in a new terminal):
  ```bash
  cd frontend
  npm start
  ```

- Now open: `http://localhost:3000`

---

## ⚙️ Features

### 👤 User

- Register/Login with JWT
- Browse products
- Add to cart
- Place orders (Stripe)
- View order history

### 🛍️ Admin

- Add/Edit/Delete products
- View all orders
- Manage users

---

## 🖼️ Image Upload

You can either:
- Use **Cloudinary** for image uploads (recommended), or  
- Store images locally in `/uploads/`

Ensure the `uploads` folder is created and accessible if using local storage.

---

## 🚚 Deployment Instructions

### Backend on Render

- Set environment variables in Render Dashboard
- Root directory: `backend`
- Build command: `npm install`
- Start command: `node server.js`

### Frontend on Vercel

- Import project from GitHub
- Set `REACT_APP_API_BASE_URL` in Vercel env to your Render backend URL  
  Example:
  ```
  https://ecommerce-clothing.onrender.com/api
  ```

---

## 🧪 Sample Test Accounts

```
User:
  Email: testuser@example.com
  Password: 123456

Admin:
  Email: admin@example.com
  Password: admin123
```

---

## 🙌 Credits

Made with ❤️ by [@Sahanaa21](https://github.com/Sahanaa21)

---

## 📜 License

This project is licensed under the MIT License.
