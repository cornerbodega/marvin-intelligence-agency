# Marvin Intelligence Agency

Marvin Intelligence Agency is an innovative web application designed to enhance interactions with AI for building complex documents, personalizing experiences, and creating expansive knowledge bases. Inspired by the capabilities of GPT models, this project offers unique approaches to managing AI-generated content and streamlining user experiences.

## Key Features

- **Dynamic Report Generation**: Create detailed reports on various topics with AI interaction. Highlight text to generate linked, contextual reports.
- **Continuum Exploration**: Discover new research areas automatically suggested by the AI.
- **Visual Engagement**: Each report and folder includes a DALL-E generated image based on its content.
- **Audio Narration**: Reports can be narrated using top-tier Google AI voices.
- **Report Sharing**: Share reports publicly via URLs.

## Getting Started

To get started with the Marvin Intelligence Agency, follow these setup steps.

## Prerequisites

Ensure you have the following installed:

- Node.js
- npm or yarn
- Git

## [1/4] Installation: Clone Repo

`git clone https://github.com/your-username/marvin-intelligence-agency.git
cd marvin-intelligence-agency
`

## [2/4] Installation: Install Dependencies

Navigate to the client and server directories in separate terminal windows and run:

### In the /client directory

npm install

### In the /server directory

npm install

## [3/4] Installation: Database Setup

### [3.1] Create a New Project in Supabase

- Go to Supabase and create a new project.
- Note down the Supabase URL and anon key.

### [3.2] Paste the Table Setup SQL into Supabase

- Use the provided SQL script in /sql/setup.sql to set up your database tables in Supabase.

## [4/4] Installation: Configure API Keys

Fill out the environment variables in the .env files for both client and server. Remove .example from the file names.

### Server .env Configuration

- **AUTH0**: Obtain your Auth0 credentials (Secret, Base URL, Issuer Base URL, Client ID, Client Secret) from your Auth0 dashboard.
- **SUPABASE**: Use the URL and keys from your Supabase project.
- **FIREBASE**: Set up your Firebase project and use the provided email and password.
- **OPENAI**: Get your API key from OpenAI.

### Client .env Configuration

- Similar to the server, fill in the Auth0 and Supabase details.
- **NEXT_PUBLIC_SERVER_UID**: This is the UID for your server, which you can set as any unique identifier.
- **GOOGLE_APPLICATION_CREDENTIALS_BASE64**: This is the base64-encoded Google Cloud service account file. Use a command line tool to base64 encode your Google Cloud credentials JSON.

## Running Locally

To run the application locally:

### Start the client

`cd client`
`yarn dev`

#### In another terminal, start the server

`cd server`
`node index.html`

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.

## Acknowledgements

Special thanks to OpenAI for the inspiration and resources that made this project possible.
[Any other acknowledgments or credits you would like to include.]
