# CrystalMatch

CrystalMatch is a modern web application that provides personalized energy reports based on users' birth information by combining traditional Chinese Bazi analysis with modern energy concepts.

## Features

- Birth date and time-based energy analysis
- Monthly energy reports with personalized recommendations
- Yearly energy forecasts and guidance
- Crystal recommendations tailored to your energy needs
- Multiple subscription tiers with varying levels of detail
- PWA support for mobile installation

## API Models

The application uses OpenAI GPT models with different capabilities based on subscription tier:
- **Free tier**: Uses gpt-4.1-mini model (1000 token limit)
- **Monthly subscription**: Uses gpt-4.1 model (2500 token limit)
- **Annual subscription**: Uses gpt-4o model (4500 token limit)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Database (PostgreSQL recommended)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/crystal-match.git
   cd crystal-match
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Environment setup
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your API keys and database connection string.

4. Initialize the database
   ```bash
   npm run db:push
   ```

5. Run the development server
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Setup

The application uses Prisma ORM for database operations. To set up the database:

1. Install PostgreSQL or your preferred database
2. Configure the connection string in `.env.local`:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/crystalmatch"
   ```
3. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
4. Seed the database (optional):
   ```bash
   npm run db:seed
   ```

## Build Issues

If you encounter issues with Prisma during the build process, you may need to:

1. Generate Prisma client before building:
   ```bash
   npx prisma generate
   ```

2. If you need to skip database initialization during build (CI environments, etc.):
   ```bash
   # Update next.config.js with:
   experimental: {
     serverComponentsExternalPackages: ['prisma', '@prisma/client'],
   }
   ```

3. For deployment, make sure your hosting environment supports database connections.

## Project Structure

```
/app
  /api        - API routes
  /components - Reusable UI components
  /lib        - Utility functions
  /types      - TypeScript type definitions
/prisma
  schema.prisma - Database schema
/public      - Static assets
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

* OpenAI GPT for powerful language modeling
* Next.js team for the amazing framework
* All contributors who have helped with the project 