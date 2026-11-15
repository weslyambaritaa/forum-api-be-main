# forum-api-BE

## CI/CD deployment

The `Continuous Integration` workflow runs on pull requests and pushes to
`main` or `master`. `Continuous Deployment` deploys to the server over SSH only
after CI succeeds. Configure these repository secrets under
**Settings > Secrets and variables > Actions** before enabling deployments:

- `SERVER_HOST`: public IP address or DNS name of the server.
- `SERVER_USERNAME`: SSH account used to deploy.
- `SERVER_SSH_KEY`: private SSH key for that account (store the key, including
  its header and footer, as a secret).
- `SERVER_PORT`: SSH port; optional, defaults to `22`.

The server must have the repository checked out at `~/forum-api`, Node.js/npm,
PM2, and NGINX installed. Provide a reachable PostgreSQL database using the
environment variables described in `.env.example`. Configure the PostgreSQL
and token environment variables for the PM2 process. Install
`nginx/forumapi.conf` in NGINX and configure its host name and Let's Encrypt
certificate paths for your server before deployment. NGINX proxies HTTPS for
`34-128-121-186.sslip.io` to port 5000 and strictly limits `/threads` and its
descendants to 90 requests per minute per client IP.
Keep port 5000 bound to localhost and blocked from public network access so
clients cannot bypass NGINX's rate limit.

The deployment workflow validates the required SSH secrets, updates the
repository, installs production dependencies, applies database migrations,
and restarts the API. Its health check URL in
`.github/workflows/continuous-deployment.yml` must match your HTTPS host.
