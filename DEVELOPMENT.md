# Development Guide

## Code Quality Tools

This project uses several tools to maintain code quality and consistency:

### 🎯 Pre-commit Hooks (Husky + lint-staged)

Pre-commit hooks automatically run when you commit code:

- **ESLint**: Checks for code quality issues and automatically fixes them
- **Prettier**: Formats code according to project standards
- **Tests**: Runs tests related to changed files
- **Commitlint**: Validates commit message format

### 📝 Commit Message Format

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes
- `perf`: Performance improvements
- `build`: Build system changes

**Examples:**

```bash
feat(auth): add user authentication
fix(api): resolve GraphQL validation error
docs: update README with setup instructions
test: add unit tests for newsletter service
```

### 🛠️ Available Scripts

```bash
# Linting
npm run lint          # Fix linting issues
npm run lint:check    # Check for linting issues (no fix)

# Formatting
npm run format        # Format all files
npm run format:check  # Check formatting (no fix)

# Testing
npm test              # Run unit tests
npm run test:watch    # Run tests in watch mode
npm run test:cov      # Run tests with coverage
npm run test:e2e      # Run end-to-end tests

# Development
npm run start:dev     # Start development server
npm run build         # Build for production
```

### 🔧 Tool Configuration

- **ESLint**: `.eslintrc.js` - Code linting rules
- **Prettier**: `.prettierrc` - Code formatting rules
- **Commitlint**: `.commitlintrc.js` - Commit message validation
- **Husky**: `.husky/` - Git hooks configuration
- **lint-staged**: `package.json` - Pre-commit file processing

### 🚫 Bypassing Hooks (Not Recommended)

In rare cases, you can bypass pre-commit hooks:

```bash
git commit --no-verify -m "emergency fix"
```

**Note**: Only use this for genuine emergencies as it skips all quality checks.

### 🏃‍♂️ Manual Quality Checks

Run quality checks manually:

```bash
# Full quality check
npm run lint && npm run format && npm test

# Check without fixing
npm run lint:check && npm run format:check
```

## Development Workflow

1. **Make changes** to your code
2. **Stage files**: `git add .`
3. **Commit**: `git commit -m "feat: add new feature"`
   - Pre-commit hooks run automatically
   - Commit message is validated
4. **Push**: `git push`

If any pre-commit checks fail, fix the issues and commit again.
