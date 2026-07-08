# 📚 LibroSphere  
### A Modern MERN Stack Library Management Platform

![LibroSphere Banner](https://img.shields.io/badge/Project-Library%20Management%20System-6D5EF8?style=for-the-badge)
![MERN Stack](https://img.shields.io/badge/Stack-MERN-green?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Completed-success?style=for-the-badge)

---

## 🌟 Overview

**LibroSphere** is a full-stack cloud-based Library Management System designed to simplify and automate everyday library operations.

Traditional libraries often struggle with manual book entries, maintaining borrowing records, tracking members, calculating overdue fines, and generating reports. LibroSphere provides a centralized digital platform where librarians can efficiently manage their complete library ecosystem.

The system allows librarians to manage books, categories, members, borrowing activities, returns, reports, analytics, and account settings through a modern and responsive dashboard.

---

# 🚀 Key Highlights

✨ Secure authentication using JWT  
✨ Individual library data isolation for every librarian  
✨ ISBN barcode scanning for quick book entry  
✨ Automatic book detail fetching using ISBN  
✨ Complete book lifecycle management  
✨ Member registration and activity tracking  
✨ Borrow and return management  
✨ Automatic overdue fine calculation  
✨ Detailed reports with PDF and CSV export  
✨ Analytics dashboard with visual insights  
✨ Responsive premium UI design  

---

# 🎯 Problem Statement

Managing libraries manually creates several challenges:

- Time-consuming book registration
- Difficulty tracking borrowed books
- Maintaining member records manually
- Lack of real-time statistics
- Errors in return tracking
- Difficulty generating reports

LibroSphere solves these problems by providing an automated and organized digital library management experience.

---

# 💡 Solution

LibroSphere transforms traditional library operations into a smart digital workflow.

A librarian can:

1. Register and securely access their library
2. Add and manage books
3. Scan ISBN barcodes to automatically fetch book information
4. Register members
5. Issue and return books
6. Track overdue books and fines
7. Generate reports
8. Analyze library performance

---

# ✨ Features

## 🔐 Authentication & Security

- Secure librarian registration and login
- JWT-based authentication
- Password encryption using bcrypt
- Protected routes
- User-specific library data management

---

# 📖 Book Management

Manage the complete book collection with:

- Add new books
- Edit book details
- Delete books
- Search books by:
  - Title
  - Author
  - ISBN
- Filter by category
- Track available copies
- Manage book categories

### 📷 ISBN Barcode Scanner

LibroSphere includes an ISBN scanning feature that allows librarians to quickly add books.

Workflow:

```
Scan ISBN Barcode
        ↓
Fetch Book Details
        ↓
Auto-fill Book Information
        ↓
Save Book
```

Automatically retrieves available information such as:

- Book title
- Author
- Publisher
- Published year
- Cover image
- Description

Manual ISBN entry is also supported.

---

# 👥 Member Management

Manage library members efficiently.

Features:

- Register members
- Auto-generate membership ID
- Store member details:
  - Name
  - Email
  - Phone
  - Address
- View member activity
- Track borrowing history
- Generate individual member reports

---

# 📚 Borrow & Return Management

Complete borrowing workflow:

## Issue Books

- Select available books
- Select members
- Set borrow date
- Set due date
- Track issued books

## Return Books

- Mark books as returned
- Maintain return history
- Automatically update availability

---

# 💰 Overdue Fine Management

LibroSphere supports automatic fine calculation.

Features:

- Configure fine amount per overdue day
- Automatic overdue detection
- Update fines dynamically
- Edit fine settings anytime

Example:

```
Fine per day = ₹5

Book overdue by 3 days

Total Fine = ₹15
```

---

# 📊 Reports & Analytics

## Reports

Generate detailed library insights:

### Library Report

Includes:

- Total books
- Total members
- Borrow records
- Return records
- Overdue details

Export options:

- PDF
- CSV

### Member Activity Reports

Generate individual member reports containing:

- Books borrowed
- Books returned
- Current borrowed books
- Overdue books
- Fine details

---

# 📈 Analytics Dashboard

Visual insights into library operations.

Includes:

### Books by Category

Displays distribution of books across categories.

### Borrow Status Distribution

Shows:

- Borrowed books
- Returned books
- Overdue books

### Monthly Borrow Trends

Tracks borrowing and returning patterns.

### Top Authors

Displays most frequently added authors.

---

# ⚙️ Settings & Preferences

Manage library preferences:

- Borrow duration
- Fine settings
- Maximum books per member
- Account management
- Delete account option

---

# 🎨 UI & Design

LibroSphere follows a premium modern dashboard experience.

Design features:

- Responsive layout
- Mobile-friendly interface
- Smooth animations
- Floating cards
- Modern gradients
- Clean navigation
- Interactive dashboards

Design system:

- Primary Color: Electric Iris
- Secondary Color: Soft Orchid
- Accent: Mango Gold

Typography:

- Poppins
- Inter

---

# 🏗️ System Architecture

```
                User
                 |
                 |
          React Frontend
                 |
              Axios API
                 |
          Express Backend
                 |
              MongoDB
```

---

# 🛠️ Tech Stack

## Frontend

- React.js
- Vite
- Tailwind CSS
- Framer Motion
- Axios
- React Router
- Recharts
- React Hot Toast
- ZXing Barcode Scanner

---

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt.js
- Cookie Parser
- CORS

---

# 📂 Project Structure

```
LibroSphere

│
├── client
│   ├── src
│   │   ├── pages
│   │   ├── components
│   │   ├── services
│   │   └── context
│
├── server
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── middleware
│   └── utils
│
└── README.md
```

---

# ⚡ Installation & Setup

## Clone Repository

```bash
git clone <repository-url>

cd LibroSphere
```

---

## Backend Setup

```bash
cd server

npm install

npm run dev
```

Create `.env`

```
PORT=5000

MONGO_URI=your_mongodb_connection

JWT_SECRET=your_secret_key

CLIENT_URL=http://localhost:5173
```

---

## Frontend Setup

```bash
cd client

npm install

npm run dev
```

---

# 🔮 Future Enhancements

Possible future improvements:

- Cloud image storage
- Email notifications for due dates
- AI-based book recommendations
- Multi-librarian roles
- Advanced inventory prediction
- Mobile application

---

# 👩‍💻 Developed By

## Zara Sultana Shaik

Computer Science Engineering  
Artificial Intelligence

Passionate about building scalable full-stack applications and exploring modern web technologies.

---

⭐ If you find this project useful, consider giving it a star!
