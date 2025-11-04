# Your Local Shop

**Your Neighbourhood Store, Now Online!**

A modern e-commerce platform that brings local shopping convenience to your fingertips. Browse daily essentials and specialty items, manage your cart, and get delivery - all from the comfort of your home.

## Key Features

- **Product Catalogue** - Browse and search products
- **Shopping Cart** - Smart cart management with inventory checking
- **Order Management** - Track orders from creation to delivery
- **Payments** - Safe payment processing with invoice generation
- **Shipment Tracking** - Updates on delivery status
- **Account Management** - Personal profile with order history
- **Admin Dashboard** - Comprehensive management tools for products, inventory, orders, and sales reports
- **Role-Based Access** - Separate interfaces for customers and administrators

## Tech Stack

- **Frontend**: Next.js (React), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: ASP.NET Core, Entity Framework Core
- **Database**: SQLite

# Development

Guide for developers of the system

## Prerequisites

- Node.js 20.x or later
- .NET 9 SDK

## Frontend (Next.js)

1. Install Node.js (https://nodejs.org/) if not already have installed

2. Go to `frontend` folder

```
cd frontend
```

3. Install frontend dependency

```
npm install
```

4. Start the website

```
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Other commands

Check eslint

```
npm run lint
```

## Backend (Dotnet)

1. (Optional if you have not had launchSettings) Create launchSettings in `Properties` folder
```
{
  "profiles": {
    "Assignment_3_SWE30003": {
      "commandName": "Project",
      "dotnetRunMessages": true,
      "applicationUrl": "http://localhost:5074",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
```

2. Run backend

```
dotnet run
```

or

```
dotnet run --launch-profile Assignment_3_SWE30003
```

3. Sync migrations when pulling new commits

### Other commands

Sync migrations

```
dotnet ef database update
```

Add new migration

```
dotnet ef migrations add <MigrationName>
```

## Default Credentials

The system creates a default admin account for development environment on first run:

- **Email**: admin@gmail.com
- **Password**: 123456789

## Project Structure

```
├── frontend/                # Next.js frontend application
│   ├── app/                 # Next.js app router pages
│   ├── components/          # Reusable React components
│   └── lib/                 # Utility functions
├── Controllers/             # ASP.NET Core API controllers
├── Models/                  # Domain models and business logic
├── Data/                    # Database context and configuration
├── Managers/                # Business logic managers
├── DTOs/                    # Data transfer objects
└── Migrations/              # Entity Framework migrations
```