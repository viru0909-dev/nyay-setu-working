#!/bin/bash
# Purges .env from git history if it was ever committed.
# Run this as repo owner after rotating all credentials.
# Requires BFG Repo Cleaner: https://rtyley.github.io/bfg-repo-cleaner/

echo "Purging .env from git history..."

bfg --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin --force --all

echo "Done. Verify with: git log --all --full-history -- .env"
echo "REMINDER: Rotate all credentials — JWT secret, DB password, Groq API key, SMTP password."