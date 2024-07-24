# ![ProPulse](frontend/public/icons/ProPulse-navBrand.svg)

## Description

This is my capstone project for the Springboard Software Engineering Bootcamp.

The vision for ProPulse is to create a team-focused environment for project communication. Simple, efficient, and intuitive.

Users can create a project thread, invite fellow users to the project thread as they see fit, and post or reply to fellow participants. If you want to grab a specific person's attention, you can tag them in your post or reply, and they will receive a notification if they've given consent.

You can find the live project here:

\*_Placeholder for link_

### Tech Stack

#### Frontend

- Framework: React 18
- Build Tool: Vite 5
- Routing: React Router 6
- State Management In Forms: Formik
- Styling: Bootstrap 5, Reactstrap

#### Backend

- Runtime: Nodejs
- Framework: ExpressJS
- Database: PostgreSQL
- Direct Queries: node-postgres
- Authentication: JSON Web Tokens (jsonwebtoken)
- Schema Validation: jsonschema
- Security: Bcrypt
- Push Notifications: Web-push

## Goal

My goal with ProPulse is to streamline project communication.

Inspired by my many years as a fire sprinkler installation foreman, I felt that many project communication apps were too bloated, cumbersome, and unnecessarily complex (I'm looking at you, Procore).

Email chains were just as bad. Sometimes communication needs to be compartmentalized on a per team basis. I would often find myself included in MASSIVE email chains with architects, engineers, CEOs, and more. What's worse, many of these messages and conversations were far outside the realm of the "boots on the ground" team's concern. It often felt like a flood of useless information, and if there were to be any relevant content, it would surely be lost in the wave.

The intent with ProPulse is to provide a dedicated channel for teams that need to communicate often, without the need to sift through the clutter. Each project thread can function as a repository of information. I believe this can greatly boost productivity amongst a team, simply due to the fact that important information is less likely to be overlooked or forgotten about, as is the case with email, text, phone calls, and bloated project management apps.

## Installation

**_This application is built with a PostgreSQL database, utilizes Node and npm, as well as nodemon._**  
**_Please ensure you have installed these requirements before proceeding._**

For local installation, follow these instructions :

1. Clone the repository into a directory named ProPulse :

   ```bash
   git clone https://github.com/SeanBailey15/ProPulse_Springboard_Capstone.git ProPulse
   ```

2. Navigate into the directory :

   ```bash
   cd ProPulse
   ```

3. Navigate into each subdirectory and install the dependencies :

   ```bash
   # Navigate into frontend directory and install dependencies
   cd frontend
   npm install
   ```

   ```bash
   # Navigate back to the root directory
   cd ..
   ```

   ```bash
   # Navigate into backend directory and install dependencies
   cd backend
   npm install
   ```

   ```bash
   # While in the backend directory, generate the databases
   psql < propulse.sql
   # You will be prompted to confirm in the terminal
   ```

   ```bash
   # Navigate back to the root directory
   cd ..
   ```

4. Install the dependencies for the root directory :

   ```bash
   # Your working directory here should be /ProPulse
   npm install
   ```

!!! Before running the app, see the Configuration section of this README below !!!

5. Run the app :

   ```bash
   # Your working directory here should be /React_Jobly
   # The following script will launch the front end and backend simultaneously
   npm run start
   # The front end is set to run on http://localhost:5173/
   ```

\*_The terminal window will display a `Ctrl + click`-able link to the app_

## Configuration

Before running the app, you will need to set up some configuration files in the **_frontend_** and **_backend_** directories.

1. You will need to use a Vapid Key Generator to generate the keys required for push notifications. I suggest [VapidKeys](https://vapidkeys.com).

2. Enter an email in the form and click generate. This should output a JSON object like this :

   ```js
   {
   "subject": "mailto: <test@email.com>",
   "publicKey": "BGAGp3eZqbrUQhHbp4riA_yFVgEla5ErbEyk9mnht28WghCgNy2RlSrLrmu1-vHmi5_TwJ2as-wo7VLXS3dxotI",
   "privateKey": "X6pMNul-MItTViiQDO6qUHxBLaI3aU98YWe9xvKOFAo"
   }
   ```

3. Be sure to keep this window open for reference, or copy and paste the object to a notepad.

4. Open ProPulse in your code editor.

5. In the TOP LEVEL of the **_backend_** directory, create a new file and label it ".env" (no quotes).

6. In the .env file, you want to create a list of environment variables like this :

   ```js
   VAPID_PUBLIC_KEY="Public-key-from-object-in-step-2" //Paste the key here, without quotes
   VAPID_PRIVATE_KEY="Private-key-from-object-in-step-2" //Paste the key here, without quotes
   MAIL_TO_ID=mailto:test@email.com //Note that the <> brackets are omitted

   /* Root path that follows is an example of a Linux/Ubuntu path.
   Your root path may differ based on your setup
   This variable can be skipped if you don't plan to run the tests */
   JEST_CONFIG_ROOT_PATH=/home/<yourUsername>/ProPulse/backend

   // You may need to include your Postgres password, depending on your Postgres installation
   PGPASSWORD="Your Postgres Password" //Do not use quotes around your password here.
   ```

7. In the TOP LEVEL of the **_frontend_** directory, create a new file and label it ".env" (no quotes).

8. In the .env file, you want to create a list of environment variables like this :

   ```js
   VAPID_PUBLIC_KEY="Public-key-from-object-in-step-2" //Paste the key here, without quotes
   VAPID_PRIVATE_KEY="Private-key-from-object-in-step-2" //Paste the key here, without quotes
   MAIL_TO_ID=mailto:test@email.com //Note that the <> brackets are omitted
   ```

9. You may now proceed to step 5 of the Installation instructions.
