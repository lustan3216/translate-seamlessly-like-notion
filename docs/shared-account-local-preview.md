# Shared account local preview

The account page is available from the isolated `account-preview` build or from the localhost Vite development server with `VITE_SHARED_ACCOUNT_PREVIEW=1`. Normal production builds drop the route and its lazy-loaded code, even when the variable is set.

## Run the isolated HTTPS build

Set `ACCOUNT_WEB_ORIGIN` to the exact HTTPS origin configured in the branch Worker, for example `https://localhost:8443`. Supply `SHARED_ACCOUNT_PREVIEW_TLS_CERT` and `SHARED_ACCOUNT_PREVIEW_TLS_KEY` as file paths outside the repository. The certificate must cover the hostname and be trusted by the test browser or phone.

Pass `SHARED_ACCOUNT_PROXY_TOKEN` into the preview server process only. It must match the branch Worker. The server defaults to the `codex/creem-shared-account` Worker Preview. A localhost run can override `SHARED_ACCOUNT_API_TARGET` to a local HTTP fixture on `127.0.0.1`. For phone testing on a private LAN, use a resolvable `.local` or `.test` hostname and set `SHARED_ACCOUNT_PREVIEW_LAN_IP` to this Mac’s private IPv4 address. Keep the listener on the test network.

```sh
account_output=$(mktemp -d)
VITE_SHARED_ACCOUNT_PREVIEW=1 npx --no-install vite build --mode account-preview --outDir "$account_output"
VITE_SHARED_ACCOUNT_PREVIEW=1 npx --no-install vite preview --mode account-preview --outDir "$account_output"
```

Visit `/account?lang=zh-tw` on that origin. For an App pairing test, set the same `ACCOUNT_WEB_ORIGIN` in the App build, open the URL from the App, and compare the two confirmation codes before approving. The App must call the same branch Worker. The Creem return flow also needs a configured success URL that the test browser can reach. Stop the preview server and remove its temporary output when the test is finished.

## Package a Vercel HTTPS Preview

`ACCOUNT_PREVIEW_DIR=$(node scripts/prepare-vercel-account-preview.mjs)` builds into a fresh temporary directory and prints its path. Link that directory to the approved Vercel project. The package serves the preview account page and its same-origin JSON API. The function requires `VERCEL_ENV=preview` and the exact system-issued `VERCEL_URL` as the request host. Leave Vercel Deployment Protection enabled for the Preview and check that the test phone can open the issued URL.

Use a dedicated Preview Git ref for this deployment. Provision the same proxy token as the branch Worker using stdin from a private, single-value file. Vercel stores it as a sensitive variable scoped to this one ref. The build does not need the token and the deployment artifact contains no credentials.

```sh
vercel --cwd "$ACCOUNT_PREVIEW_DIR" env add SHARED_ACCOUNT_PROXY_TOKEN --environment preview \
  --git-branch "$ACCOUNT_PREVIEW_BRANCH" --sensitive --yes < "$ACCOUNT_PREVIEW_TOKEN_FILE"
vercel --cwd "$ACCOUNT_PREVIEW_DIR" deploy --prebuilt --environment preview \
  --meta githubDeployment=1 --meta "githubCommitRef=$ACCOUNT_PREVIEW_BRANCH"
```

Use the HTTPS URL printed for that deployment as the account origin in the branch Worker and its Creem Test Mode success URL. Leave the Creem webhook receiver on the branch Worker. Confirm the exact host can register a passkey and open the account session before delivering a phone build. End the test by removing the dedicated deployment and branch-scoped variable when they are no longer needed.

The production packaging script stays separate. The local proxy fixture runs with `node --test scripts/vercel-account-preview-proxy.test.mjs`.

## Start the local website

1. Configure the account-enabled Dev Worker with the exact browser origin, such as `http://localhost:8080`. The registered passkey is tied to that origin's hostname.
2. Run `VITE_SHARED_ACCOUNT_PREVIEW=1 npm run dev` with the exact `ACCOUNT_WEB_ORIGIN` and server-only `SHARED_ACCOUNT_PROXY_TOKEN` supplied through the project's local environment. Keep the proxy token out of `VITE_*` variables.
3. Open `http://localhost:8080/account?lang=zh-tw` in a passkey-capable browser. For an App pairing test, open the URL from the App and compare the two confirmation codes before approving. The App must call the same Dev environment.

If test billing is enabled in the Dev Worker, set the Creem Test Mode success URL to the selected account origin plus `/account?billing=return`. On return, the account page reloads subscription status while waiting for the test webhook. Use a known test account when verifying the customer portal and cancellation. The Apple storefront pricing page continues using its own pricing source.

Use the signed-in text form to check the Dev translation route. Account deletion requires a recent passkey verification and a resolved test subscription. It removes the shared sign-in and linked installations from the account while Apple continues to manage its subscriptions.
