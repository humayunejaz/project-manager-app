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

- **React.js**: UI framework
- **Material-UI**: Component library for modern, responsive design
- **React Router**: Page navigation
- **EmailJS**: Sends email invitations without backend server

### Backend

- **Supabase**: Provides authentication and PostgreSQL database services
  - Tables: `users`, `projects`, `travelers`, `project_travelers`, `project_locations`

## Folder Structure

