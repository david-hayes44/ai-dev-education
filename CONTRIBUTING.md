# Contributing to AI-Dev Education Platform

Thank you for your interest in contributing to the AI-Dev Education Platform! This document outlines our contribution process and guidelines.

## Git Workflow

We follow a structured Git workflow for this project:

```
feature branches → develop → main
```

1. **Main Branch**: Production-ready, stable code
2. **Develop Branch**: Integration branch for features
3. **Feature Branches**: Individual features and components

### Branch Naming Convention

- Use prefixes for branch names:
  - `feature/` - New features or components
  - `bugfix/` - Bug fixes
  - `docs/` - Documentation updates
  - `refactor/` - Code refactoring without changing functionality
  - `test/` - Adding or modifying tests

Examples:
- `feature/chat-component`
- `bugfix/sidebar-collapse`
- `docs/api-reference`

## Development Process

1. **Create a Feature Branch**
   ```bash
   git checkout develop
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes and Commit**
   ```bash
   git add .
   git commit -m "Clear, descriptive commit message"
   ```

3. **Push Your Branch**
   ```bash
   git push -u origin feature/your-feature-name
   ```

4. **Create a Pull Request**
   - Create a PR to merge your feature branch into `develop`
   - Fill out the PR template with all required information
   - Request a review from a team member

5. **Address Review Feedback**
   - Make any requested changes
   - Push updates to your branch

6. **Merge to Develop**
   - Once approved, your PR will be merged to the `develop` branch

7. **Release to Main**
   - Periodically, `develop` will be merged to `main` as a new release

## Coding Standards

- Follow the existing code style and structure
- Write clear, descriptive variable and function names
- Include comments for complex logic
- Write unit tests for new features when applicable

## Commit Messages

- Use clear, descriptive commit messages
- Start with a verb in the present tense (e.g., "Add", "Fix", "Update")
- Reference issue numbers when applicable
- Keep messages concise but informative

## Pull Request Guidelines

- PRs should address a single concern or feature
- Include a clear description of the changes
- Link any related issues
- Ensure all CI checks pass
- Request reviews from appropriate team members

## Questions?

If you have any questions about contributing, please reach out to the project maintainers. 