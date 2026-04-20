# GitHub Actions Setup

## FTP Deployment Configuration

This repository includes an automated deployment workflow that syncs your code to your server via FTP whenever you push to the main branch.

### Required GitHub Secrets

You need to add these secrets to your GitHub repository:

1. Go to your GitHub repository
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add these three secrets:

| Secret Name | Value |
|-------------|-------|
| `FTP_SERVER` | Your FTP server hostname (e.g., `ftp.yourdomain.com` or IP address) |
| `FTP_USERNAME` | `admin` |
| `FTP_PASSWORD` | `Adminftp123` |

### How it Works

1. **Trigger**: Runs automatically when you push to the `main` branch
2. **Build**: Installs dependencies and builds the application
3. **Deploy**: Uploads only production files to your server via FTP:
   - Built application files from `/dist/` folder
   - `package.json` and `package-lock.json` for dependency management

### Manual Deployment

You can also trigger the deployment manually:
1. Go to **Actions** tab in your GitHub repository
2. Select **Deploy to Server via FTP**
3. Click **Run workflow**

### File Structure on Server

The deployment creates a minimal production structure on your server:
- Built application files in the root directory (from `/dist/`)
- `package.json` and `package-lock.json` for dependency information
- Environment files are excluded (you'll need to create `.env` on your server)

### Important Notes

- Make sure your FTP server allows the GitHub Actions IP ranges
- The `.env` file is excluded from deployment for security - create it manually on your server
- The workflow builds the project before deployment and only uploads production-ready files
- Only the contents of `/dist/` folder plus package files are deployed for a clean production environment