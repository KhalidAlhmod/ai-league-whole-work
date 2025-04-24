
# SmartTicket - Secure Event Ticketing System

SmartTicket is a comprehensive platform for purchasing, managing, and reselling event tickets with secure authentication and transaction history tracking.

## Features

- **User Authentication**: Secure email/password authentication via Supabase Auth
- **Ticket Management**: Purchase tickets for events and manage your purchased tickets
- **Ticket Reselling**: Resell tickets to other users with full transaction history
- **Admin Panel**: Admin interface for managing events
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

## Technology Stack

- **Frontend**: React with TypeScript
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **Backend**: Supabase (PostgreSQL database + Auth)
- **State Management**: React Query for server state
- **Forms**: React Hook Form with Zod validation

## Database Schema

The application uses the following database tables:

- **users**: User account information
- **events**: Event details including location, date/time, and teams
- **tickets**: Ticket ownership and status information
- **transactions**: Record of all ticket purchases and resales

## Prerequisites

To run this application, you'll need:

- Node.js (v16 or higher)
- NPM or Yarn
- A Supabase account and project

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/smart-ticket.git
cd smart-ticket
```

2. Install dependencies:

```bash
npm install
# or
yarn
```

3. Set up the database:

Run the `database_seed.sql` script in your Supabase SQL editor to create the necessary tables, policies, and functions.

4. Start the development server:

```bash
npm run dev
# or
yarn dev
```

## Database Setup

1. Create a new Supabase project
2. Go to the SQL Editor in your Supabase dashboard
3. Paste and run the contents of `database_seed.sql`
4. Set up Row Level Security (RLS) as defined in the SQL file

## Deployment

To build for production:

```bash
npm run build
# or
yarn build
```

The built application can be deployed to any static hosting service (Vercel, Netlify, etc.) that supports SPAs.

## User Roles

- **Regular Users**: Can sign up, browse events, buy tickets, and resell their tickets
- **Admins**: Can manage events (create, edit, delete) and have all regular user capabilities

## Authentication Flow

1. User signs up with email/password and profile information
2. Supabase Auth creates the user account
3. Custom DB trigger creates a record in the `users` table
4. User can log in with their email/password
5. JWT token is used for authenticating API requests and RLS policies

## License

MIT

## Support

For support, please open an issue in the GitHub repository or contact support@smartticket.com.
