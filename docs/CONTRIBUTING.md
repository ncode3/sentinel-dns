# Contributing to Project Sentinel

Thank you for your interest in contributing to Project Sentinel! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Please:

- Be respectful and inclusive in your communication
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/sentinel-dns.git
   cd sentinel-dns
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/ncode3/sentinel-dns.git
   ```

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Type check
npm run type-check
```

## Making Changes

### Branch Naming

Use descriptive branch names following this pattern:
- `feature/description` - For new features
- `fix/description` - For bug fixes
- `docs/description` - For documentation changes
- `refactor/description` - For code refactoring

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(watcher): add support for additional probe regions
fix(brain): handle API timeout gracefully
docs(readme): update installation instructions
```

## Pull Request Process

1. **Update your fork** with the latest upstream changes:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature
   ```

3. **Make your changes** and commit them with descriptive messages

4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature
   ```

5. **Open a Pull Request** against the `main` branch

6. **Fill out the PR template** completely

7. **Wait for review** - maintainers will review your PR and may request changes

### PR Checklist

Before submitting your PR, ensure:

- [ ] Code follows the project's coding standards
- [ ] All tests pass (`npm test`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Documentation is updated if needed
- [ ] Commit messages follow conventional commits
- [ ] PR description clearly explains the changes

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Provide explicit types (avoid `any`)
- Use interfaces for object shapes
- Document complex types with JSDoc comments

### React

- Use functional components with hooks
- Keep components small and focused
- Use custom hooks for reusable logic
- Follow the existing component structure

### Styling

- Use Tailwind CSS classes
- Follow the existing color scheme (ops-* classes)
- Ensure responsive design

### File Structure

```
src/
├── components/     # React components
├── hooks/          # Custom React hooks
├── services/       # API and external services
├── utils/          # Helper functions
├── types.ts        # TypeScript type definitions
└── constants.ts    # Application constants
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Writing Tests

- Write tests for new features and bug fixes
- Use descriptive test names
- Test edge cases and error conditions
- Mock external dependencies

### Test File Location

Place test files in `__tests__` directories adjacent to the code being tested:

```
src/
├── components/
│   ├── __tests__/
│   │   └── SystemStatus.test.tsx
│   └── SystemStatus.tsx
```

## Questions?

If you have questions, please:

1. Check existing [issues](https://github.com/ncode3/sentinel-dns/issues)
2. Open a new issue with your question
3. Join the discussion in open PRs

Thank you for contributing to Project Sentinel! 🛡️
