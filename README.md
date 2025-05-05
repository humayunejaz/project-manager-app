# Project Manager App

This is a full-stack project management web application built with React and Supabase. It allows users to register, log in, create projects, invite collaborators, and manage project details such as dates, countries, cities, and travelers.

## Features

- User Registration and Login
- Dashboard to view and manage projects
- Create projects with:
  - Project name
  - Start and end date
  - 1 to N countries (with city selection per country)
  - Add multiple travelers (name, email)
- Edit and delete existing projects
- Email invitations sent to added travelers via EmailJS
- Invited users can register and view shared projects upon logging in

## Technologies Used

### Frontend

- React.js: UI framework
- Material-UI: Component library for modern, responsive design
- React Router: Page navigation
- EmailJS: Sends email invitations without backend server

### Backend

- Supabase: Provides authentication and PostgreSQL database services
  - Tables: `users`, `projects`, `travelers`, `project_travelers`, `project_locations`

## Folder Structure

```
project-manager-app/
├── public/
├── src/
│   ├── App.js
│   ├── supabase.js
│   ├── RegisterPage.js
│   ├── LoginPage.js
│   ├── Dashboard.js
│   ├── CreateProjectPage.js
│   └── EditProjectModal.js
├── package.json
└── README.md
```

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/project-manager-app.git
   cd project-manager-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Supabase:
   - In `/src/supabase.js`, add your `supabaseUrl` and `supabaseKey`

4. Start the app:
   ```bash
   npm start
   ```

5. App runs on: `http://localhost:3000`

## Project Functionality

- Users sign up and are taken to the login page
- After login, users can view all projects they've created or been invited to
- Projects include editable details and email-based invitations
- Invited users receive an email with a join link, and upon login, they see shared projects

## License

This project is for educational and demonstration purposes.
