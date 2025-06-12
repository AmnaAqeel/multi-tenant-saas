# Multi-Tenant SaaS Dashboard  
A multi-tenant SaaS dashboard with authentication, notifications, and real-time updates.  

## Features  

- **Multi-Tenant Architecture**  
  Each tenant (client/business) has isolated access to their own data and users

- **Authentication & Authorization**  
  Secure login with JWT, including protected routes and session handling

- **Role-Based Access Control (RBAC)** *(Partially implemented)*  
  Assign roles and restrict access to routes and features (work in progress)

- **Real-time Notifications**  
  Using Socket.IO to send instant updates between server and clients

- **Automated Email Notifications**  
  Integrated with Nodemailer for password resets and invitation

- **MongoDB Atlas Integration**  
  Cloud-based scalable database with connection pooling

- **Clean Project Architecture**  
  Modular structure with proper separation of concerns (routes, controllers, services, etc.)

- **Middleware Support**  
  Custom middlewares for logging, error handling, auth, CORS, and more

- **API Input Validation**  
  Express-validator used for validating incoming requests

- **Security Features**  
  Helmet for setting secure HTTP headers, Rate Limiting to prevent abuse

- **Cloudinary Integration**  
  Upload and manage images in the cloud



## Tech Stack  
- **Backend**: Node.js, Express, MongoDB (Atlas)  
- **Frontend**: React, TailwindCSS  
- **Real-time**: Socket.IO  
- **Emails**: Nodemailer  
- **Image Uploads**: Cloudinary  
- **CI/CD**: GitHub Actions *(Planned)*  

## Installation  
```bash
git clone https://github.com/AmnaAqeel/multi-tenant-saas.git
cd multi-tenant-saas
npm install

