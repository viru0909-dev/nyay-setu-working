# Contributing to Nyay Saarthi 🤝

First off, thank you for considering contributing to Nyay Saarthi! Whether you're here as part of an open source program like GSSoC or simply driven by the mission of accessible justice, we appreciate your help.

This project thrives on community collaboration. Let's build something impactful together!

## 🛠️ Development Process

1. **Fork** the repository using the button in the top right of the GitHub page.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/nyay-setu-working.git
   ```
3. **Set the upstream remote** so you can stay updated with changes in the original repo:
   ```bash
   cd nyay-setu-working
   git remote add upstream https://github.com/viru0909-dev/nyay-setu-working.git
   ```
4. **Create a branch** for your feature or bug fix:
   ```bash
   git checkout -b feature/amazing-feature
   ```
   *(Keep branch names descriptive: `fix/...`, `docs/...`, `feature/...`)*
5. **Make your changes** and test them locally.
6. **Commit your changes**:
   ```bash
   git commit -m "feat: add amazing feature"
   ```
7. **Push** your branch to your fork:
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Open a Pull Request** against the `main` branch of this repository.

## 📝 Commit Message Convention

We strongly encourage following [Conventional Commits](https://www.conventionalcommits.org/). This helps to keep a clean, readable history format.

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation only changes
- `style:` - Changes that do not affect the meaning of the code (white-space, formatting, etc.)
- `refactor:` - A code change that neither fixes a bug nor adds a feature
- `test:` - Adding missing tests or correcting existing tests
- `chore:` - Changes to the build process or auxiliary tools

## 💻 Code Style Guidelines

- **Java (Backend):** We adhere to the standard [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html). 
- **React (Frontend):** 
  - Use functional components and React Hooks exclusively.
  - Follow our existing folder structure (`components/`, `pages/`, `services/`).
- **CSS:** We try to use custom CSS variables to stick to our design theme. Please avoid injecting new inline styles unless absolutely necessary.

## 🙋 Getting Help

If you run into issues, or if an issue description isn't clear, please leave a comment on the respective GitHub Issue thread! We monitor issues daily and want to help you successfully get your PR merged.

Happy Coding! 🎉
