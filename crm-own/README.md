# CRM for Small Businesses

A web-based CRM system designed to help small businesses manage customer relationships, track sales leads, and analyze business performance.

## Features

- User authentication with JWT
- Role-based access control (Admin/User)
- Customer management (CRUD)
- Lead and sales tracking
- Dashboard with analytics

## Tech Stack

- **Frontend:** React.js
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT

## Getting Started

### Prerequisites

- Node.js
- MongoDB

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```
3. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```
   cd backend
   npm start
   ```
2. Start the frontend:
   ```
   cd frontend
   npm start
   ```

The application will be available at `http://localhost:3000` for frontend and `http://localhost:5000` for backend API.

## API Endpoints

- POST /register - Register user
- POST /login - Login user
- GET /customers - Get customers
- POST /customers - Add customer
- PUT /customers/:id - Update customer
- DELETE /customers/:id - Delete customer
- GET /leads - Get leads
- POST /leads - Add lead

## Contributing

Contributions are welcome. Please open an issue or submit a pull request.

## License

This project is licensed under the ISC License.