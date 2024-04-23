# CMPT372-Project (CTAT E-Commerce Website)

This is an e-commerce website developed as the final project for CMPT372 at SFU. The frontend is built with Next.js and hosted on Google Cloud Run. The backend is built with Express.js, and the database used is PostgreSQL, both hosted on a Linux Google Cloud Compute Engine.

Visit the website at https://cmpt372-project-frontend-image-k3yu47pw6q-wl.a.run.app/ </br>
Note: web application will only function when the backend compute engine is online

## How to Run Locally

- Ensure docker is installed on your system https://docs.docker.com/engine/install/
- Create a PayPal Developer account and create a new REST API app at https://developer.paypal.com/home
- Create a Google OAuth2.0 Client ID, instructions at https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow
  - In the Authorized JavaScript origins section, add `http://localhost:3000` as one of the URIs

### Frontend environment variables

1. From the root of the project, cd into `./frontend`
2. Create a new environment variable file called `.local.env`, which should contain the following variables:

```
GOOGLE_CLIENT_ID='your Google client ID'
SECRET_KEY='any secret key used to encrypt data'
PAYPAL_CLIENT_ID='your PayPal developer client ID'
BACKEND_SERVER_BASE_URL='http://localhost:8080'
```

Replace the values of the environment variables with your relevant keys.

### Backend environment variables

1. From the root of the project, cd into `./backend`
2. Create a new environment variable file called `.env`, which should contain the following variables:

```
PAYPAL_CLIENT_ID='your PayPal developer client ID'
PAYPAL_CLIENT_SECRET='your PayPal developer secret'
```

Replace the values of the environment variables with your relevant keys.

### Running the application
- From the root of the project, run `docker-compose up`
- Wait for all of the docker containers to start up
- Now that both the frontend, backend, and database are running, the application should be accessible in your browser at `http://localhost:3000`

<!-- TODO: note about inserting test data, vendor + admin accounts -->
