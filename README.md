# BillMaster - Project & Invoice Management System

BillMaster is a comprehensive web application for managing clients, projects, and invoices. It provides a professional interface for tracking business relationships, project progress, and financial transactions.

## Features

### 1. Dashboard
- Overview of key metrics
- Total revenue tracking
- Active projects count
- Pending invoices
- Recent activity feed

### 2. Client Management
- Add and manage clients
- Store client details (name, email, phone, company)
- View client history
- Track client-specific projects

### 3. Project Management
- Create and track projects
- Assign projects to clients
- Set project budgets and deadlines
- Track project status (ongoing/completed)
- Project progress monitoring

### 4. Invoice Management
- Generate professional invoices
- Automatic invoice numbering
- Track payment status
- Send invoice reminders
- Mark invoices as paid/pending
- Print-friendly invoice format

### 5. Email Integration
- Automated invoice emails
- Payment reminders
- Email notifications
- Custom email templates

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Frontend**: EJS, CSS, JavaScript
- **Email Service**: Nodemailer
- **Authentication**: JWT (JSON Web Tokens)
- **Other Tools**: Mongoose, Node-cron

## Installation Guide

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Git
- npm (Node Package Manager)

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/billmaster.git
cd billmaster
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Setup
Create a `.env` file in the root directory with the following variables:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/billmaster
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

### Step 4: Database Setup
```bash
# Start MongoDB service
mongod

# The application will automatically create required collections
```

### Step 5: Start the Application
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Usage Guide

### 1. Adding a New Client
1. Navigate to Clients page
2. Click "Add New Client"
3. Fill in client details
4. Click "Save Client"

### 2. Creating a Project
1. Go to Projects page
2. Click "Add New Project"
3. Select client
4. Fill project details
5. Set budget and timeline
6. Click "Create Project"

### 3. Generating Invoices
1. Visit Invoices page
2. Click "Create New Invoice"
3. Select client and project
4. Add invoice items
5. Set due date
6. Click "Create & Send Invoice"

### 4. Tracking Payments
1. Open Invoices page
2. Find relevant invoice
3. Click "Mark as Paid"
4. System updates project status automatically

## API Documentation

### Client Endpoints
- `GET /clients` - List all clients
- `POST /clients` - Create new client
- `PUT /clients/:id` - Update client
- `DELETE /clients/:id` - Delete client

### Project Endpoints
- `GET /projects` - List all projects
- `POST /projects` - Create new project
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

### Invoice Endpoints
- `GET /invoices` - List all invoices
- `POST /invoices` - Create new invoice
- `PUT /invoices/:id/status` - Update invoice status
- `POST /invoices/:id/resend` - Resend invoice email

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE.md file for details

## Support

For support, email support@billmaster.com or raise an issue in the GitHub repository.

## Acknowledgments

- Node.js community
- MongoDB team
- Express.js contributors
- All open-source contributors

## Screenshots

[Add screenshots of key features here]

## Roadmap

- [ ] Multi-language support
- [ ] Dark/Light theme toggle
- [ ] Mobile application
- [ ] Advanced reporting
- [ ] Payment gateway integration 