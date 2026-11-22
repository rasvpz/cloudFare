# Cloud Flare Rewards

## Local development

```sh
npm ci
npm run dev
```

Run the test suite with `npm test` and create a production build with `npm run build`.

## CI/CD and deployment

The GitHub Actions workflow runs tests and builds on pushes and pull requests targeting `main`. Successful pushes to `main` are deployed to GitHub Pages at <https://rasvpz.github.io/cloudFare/>.

The workflow builds the app with the `/cloudFare/` base path and deploys through GitHub Pages Actions. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions** if it is not already configured.