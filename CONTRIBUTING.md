# Contributing to Nyay Saarthi 🤝

First off, **thank you so much** for considering contributing to Nyay Saarthi! 🎉 

Whether you are a seasoned open-source veteran, a participant in programs like GSSoC (GirlScript Summer of Code), or someone making their very first pull request, **you are absolutely welcome here**. We believe that accessible justice is a mission we can only achieve together, and we truly value your time, effort, and passion.

We want to make your contribution experience as smooth, friendly, and rewarding as possible. Please read through this guide to understand how we collaborate.

---

## 🫂 Our Community Vibe

We are a community-driven project. We expect all contributors to be respectful, kind, and supportive of one another. We are all here to learn and build something meaningful. There are no "stupid" questions here!

---

## 🎯 How to Find Something to Work On

1. **Check the Issues Tab:** Browse our open issues to see what needs work.
2. **Look for Tags:** If you're new, look for issues labeled `good first issue` or `help wanted`. If you are part of GSSoC, look for the `gssoc` or `gssoc'26` labels.
3. **Ask to be Assigned:** 
   - Found an issue you like? Great! **Please leave a comment asking to be assigned.**
   - 🛑 **Important Rule:** Please **do not** start working on an issue or open a Pull Request for an issue that is already assigned to someone else. It creates duplicate work and confusion.
   - *Note:* If an issue has been assigned to someone but there has been no activity or PR from them for **7 days**, we may unassign them so someone else (like you!) can take over.

---

## 🛠️ Step-by-Step Development Process

Ready to code? Awesome. Here is the standard workflow:

### 1. Fork & Clone
1. **Fork** this repository using the button in the top right of the GitHub page.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/nyay-setu-working.git
   ```
3. **Set the upstream remote** so you can pull the latest changes from our main repository:
   ```bash
   cd nyay-setu-working
   git remote add upstream https://github.com/viru0909-dev/nyay-setu-working.git
   ```

### 2. Set Up Your Local Environment
Before you start coding, you need to get the app running locally!
- Check out [RUN_LOCALLY.md](./RUN_LOCALLY.md) or [QUICKSTART.md](./QUICKSTART.md) for detailed instructions on spinning up the Java Spring Boot backend and the React frontend.

### 3. Create a Branch
Always create a new branch for your work. **Do not work directly on the `main` branch.**
```bash
git checkout -b feature/your-amazing-feature
```
*(Tip: Keep branch names descriptive, like `fix/navbar-bug` or `feature/login-ui`)*

### 4. Code & Test
Make your magic happen! Please ensure your code runs locally without errors before you commit your changes.

### 5. Commit Your Changes
We love clean commit history! We follow the [Conventional Commits](https://www.conventionalcommits.org/) standard.
```bash
git commit -m "feat: add amazing login feature"
```
**Common Prefixes:**
- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation only changes
- `style:` - Code formatting, missing semicolons, etc.
- `refactor:` - Code changes that neither fix a bug nor add a feature

### 6. Push & Pull Request
Push your branch to your fork:
```bash
git push origin feature/your-amazing-feature
```
Finally, go to the original Nyay Saarthi repository and click **Compare & pull request**. 

---

## 💻 Code Style Guidelines

To keep our codebase clean and consistent:

- **Java (Backend):** We adhere to the [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html).
- **React (Frontend):** 
  - Use functional components and React Hooks exclusively.
  - Follow our existing folder structure (`src/components/`, `src/pages/`, etc.).
- **CSS:** Use our predefined custom CSS variables for colors and themes. Try to avoid writing new inline styles unless absolutely necessary.

---

## 🙋 Stuck? Need Help?

Open source can be intimidating, but we've got your back! If you run into issues, get stuck on a bug, or just don't understand how a piece of code works:
- Leave a comment on the GitHub Issue you are working on.
- Tag the maintainers.

We monitor the repository daily and we *want* to help you get your PR successfully merged.

Thank you for making Nyay Saarthi better! Happy Coding! 🚀
