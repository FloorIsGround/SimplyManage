# SimplyManage: Digital Library Management System

## Overview
SimplyManage is a web-based digital library management system created for a Software Engineering course project. The goal of the system is to provide a centralized way for patrons, staff, librarians, and administrators to manage library operations such as catalog browsing, item details, holds, circulation, fees, and administrative functions.

The project was designed to improve accuracy, support modern web access, and make common library workflows easier to manage for both patrons and staff.

## Team
Group 7  
- Chelsey Hecker  
- Jace Hesford  
- Nicholas La Claire  
- Nicholas Pollard  

## Purpose
Many library tasks are often handled across disconnected systems or manual workflows. SimplyManage was developed to bring these tasks into one system so that users can:
- search and browse the catalog
- view item information and availability
- place holds
- manage circulation tasks
- track loans and fees
- support staff and administrative workflows

## Main Features
### Patron Features
- Browse and search the catalog
- View item details and availability
- Create an account / sign up
- View reviews
- Access help/FAQ content
- View hours and location information
- Patron dashboard functionality in progress
- Holds, notifications, and payment-related features still being completed

### Staff and Admin Features
- Manage catalog items
- Manage copies and item status
- Support circulation-related workflows
- View loan history
- Hold fulfillment management
- Roles and permissions support on the backend
- Additional administrative and reporting features still in progress

## Tech Stack
### Frontend
- React
- TypeScript
- Vite
- CSS

### Backend
- Node.js
- Express
- TypeScript

### Database
- PostgreSQL

## System Roles
The system is designed around several user roles:
- **Patron**: searches the catalog, views items, places holds, checks account activity
- **Administrator / Management**: manages roles, permissions, and reporting functions

## Project Structure
The project is divided into a frontend and backend architecture.

Typical structure:
- **frontend**: user interface, routing, pages, components, styling
- **backend**: API routes, models, middleware, database configuration, business logic
- **database**: PostgreSQL schema and persistent storage

## Setup and Installation
### 1. Clone the repository

### 2. Install dependencies
Install dependencies in both the frontend and backend folders:
frontend (from root):
bash
cd react-ui
npm install

backend (from root):
bash
cd backend
npm install

### 5. Run the backend
From the backend folder:
bash
npm run dev


### 6. Run the frontend
From the frontend folder:
bash
npm run dev

### 7. Open the application
Open the local frontend URL:
http://localhost:5173


## Example Workflows
### Patron Workflow
1. Open the site
2. Search for a book
3. View item details
4. Read reviews or check availability
5. Create an account or sign in
6. Use dashboard or hold-related features when available

### Staff Workflow
1. Access staff/admin area
2. Look up patron or item information
3. Perform circulation-related actions
4. Update catalog items or copy status
5. Manage holds and review loan history

## Design Approach
SimplyManage follows a client/server architecture:
- the **frontend** handles the user interface and user interaction
- the **backend** handles business logic and API requests
- the **database** stores persistent library data

## Testing
The project includes design work for:
- test cases
- test coverage
- integration testing

Testing focuses on critical workflows such as:
- login
- catalog browsing/search
- item details
- holds
- circulation transactions
- catalog management
- copy/status management
- fee/payment workflows

## Documentation
This project was developed alongside formal software engineering documentation, including:
- requirements
- use cases
- system sequence diagrams
- class diagrams
- domain model
- mathematical model
- algorithms
- data structures
- architecture and planning sections
- design of tests

## References
Some project and design work referenced course materials and external tools/APIs used during development, including:
- Open Library Covers API
