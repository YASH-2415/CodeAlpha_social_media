# CodeAlpha_social_media
A modern full-stack social media application developed using MongoDB, Express.js and React. Features include secure authentication, user profiles, post creation, comments, likes, follow/unfollow functionality, image uploads, and a fully responsive interface.

## GitHub Codespaces Setup

This repository is configured to run in GitHub Codespaces without committing a `.env` file.

### What is included

- `.devcontainer/devcontainer.json` for Codespaces container configuration
- `.devcontainer/docker-compose.yml` to run the Node app and MongoDB service
- `server/.env.example` and `client/.env.example` for local environment variable templates
- root `package.json` scripts to start server and client together

### Run in Codespaces

1. Open this repository in GitHub Codespaces.
2. Create / copy environment files inside Codespaces only:
   - `server/.env` from `server/.env.example`
   - `client/.env` from `client/.env.example`
3. Start the app:
   - `npm run dev`
4. Open forwarded ports:
   - backend: `5000`
   - frontend: `5173`

### Notes

- `.env` files are ignored by `.gitignore`, so secrets will not be committed.
- Use repository secrets or Codespaces environment variables if you prefer not to use local `.env` files.
