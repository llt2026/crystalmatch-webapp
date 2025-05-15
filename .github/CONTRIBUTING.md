# Contributing to CrystalMatch

We love your input! We want to make contributing to CrystalMatch as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### Pull Requests

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Pull Request Process

1. Update the README.md with details of changes to the interface, if applicable
2. You may merge the Pull Request once you have the sign-off of two other developers, or if you 
   do not have permission to do that, you may request the second reviewer to merge it for you

## Development Environment Setup

Follow these steps to set up a development environment:

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/crystal-match.git
   cd crystal-match
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Copy the environment variables
   ```bash
   cp .env.example .env.local
   ```

4. Set up the database (refer to the README.md for database configuration)

5. Run the development server
   ```bash
   npm run dev
   ```

## Building and Testing

Before submitting a PR, make sure the project builds and passes all tests:

1. Build the project
   ```bash
   npm run build
   ```

2. Run tests
   ```bash
   npm test
   ```

3. Check for linting errors
   ```bash
   npm run lint
   ```

## Known Build Issues

If you encounter Prisma-related build issues:

1. Try generating the Prisma client first:
   ```bash
   npx prisma generate
   ```

2. For CI environments, you might need to modify `next.config.js` as outlined in the README.

## Code Style

- Follow the TypeScript standards used in the project
- Use meaningful variable and function names
- Write comments for complex logic
- Follow the Airbnb JavaScript Style Guide

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License. 