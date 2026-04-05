# RAPLIFY Secure Backend 🚀

This is the Node.js / Express backend for the RAPLIFY project, designed to increase security and enable *real* phone verification.

## Architecture

We use **Twilio** to handle real phone SMS verification to ensure it's secure. 

## Setup Instructions

1. Install Node.js from https://nodejs.org if you haven't already.
2. Open a terminal in this `backend` folder.
3. Run `npm install` to install dependencies.
4. Copy `.env.example` to a new file named `.env`.
5. Create a free account at [Twilio](https://twilio.com), set up a Verify Service, and paste your `SID` and `Auth Token` into the `.env` file.
6. Run `npm run dev` to start the server.

The server will be running on `http://${API_URL}`. The frontend uses these endpoints for login and registration.
