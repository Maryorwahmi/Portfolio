# CONTRIBUTING.md
# Contributing to NovaQueue

**Created by CaptainCode | NovaCore Systems**

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch: `git checkout -b feature/my-feature`
4. Install dependencies: `npm install`

## Development

### Running Services
```bash
# Terminal 1 - API
npm run api

# Terminal 2 - Worker
npm run worker

# Terminal 3 - Scheduler
npm run scheduler
```

### Code Style
- Use TypeScript strict mode
- Follow ESLint rules: `npm run lint`
- Format with Prettier before committing
- Add JSDoc comments for public APIs

### Testing
```bash
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov
```

## Commit Guidelines

**Format**: `type(scope): subject`

Examples:
- `feat(api): add job prioritization`
- `fix(worker): handle handler timeout`
- `docs(readme): update setup instructions`
- `refactor(scheduler): optimize query`

## Pull Request Process

1. Update README/docs if needed
2. Add tests for new features
3. Ensure all tests pass: `npm run test`
4. Ensure linting passes: `npm run lint`
5. Keep commit history clean
6. Write clear PR description

## Code Review

Code will be reviewed for:
- Functionality and correctness
- Performance and scalability
- Code quality and maintainability
- Test coverage
- Documentation

---

**Thank you for contributing! 🙌**  
**Created by CaptainCode**
