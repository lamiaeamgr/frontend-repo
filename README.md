# frontend-repo

Standalone React frontend project with independent DevOps tooling.

## Features
- Home page
- Items page (fetches from backend API)
- Add item form
- Loading and error states
- Responsive UI
- API URL through `VITE_API_URL`

## Environment
Create `.env`:

```env
VITE_API_URL=http://localhost:5000
```

## Run locally
```bash
npm install
npm run dev
```

App runs on `http://localhost:3000`.

## Test and build
```bash
npm test
npm run build
```

## Docker
Build and run:

```bash
docker build -t frontend-repo:latest .
docker run -d --name frontend-repo-container -p 3000:3000 frontend-repo:latest
```

## CI (GitHub Actions)
Workflow: `.github/workflows/ci.yml`
- Triggers on push
- Installs dependencies
- Runs tests
- Builds app

## CD (Jenkins)
Pipeline: `Jenkinsfile`
- Checkout
- Install dependencies
- Build app
- Build Docker image
- Run container
- Send Slack notification via webhook credential `frontend-slack-webhook`

## SonarQube
Config file: `sonar-project.properties`

Example analysis command:
```bash
sonar-scanner \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=YOUR_SONAR_TOKEN
```
