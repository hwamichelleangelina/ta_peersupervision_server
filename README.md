# Peer Supervision Performance Monitoring System - Backend Server
This repository contains the backend server for the Peer Supervision Performance Monitoring System, developed as part of the final project at Institut Teknologi Bandung (ITB). The system is designed to manage and monitor the performance of student peer supervision services provided by ITB. The backend handles the core business logic, database interactions, and API endpoints needed for the system.

## Features
- User Authentication: Secure login and authentication for both students and administrators.
- Performance Monitoring: Allows administrators to track and evaluate peer supervision sessions.
- Data Management: Full CRUD (Create, Read, Update, Delete) capabilities for users, sessions, and performance records.
- RESTful API: Provides a set of RESTful API endpoints for interaction with the frontend application.

## Tech Stack
- Backend Framework: Node.js with Express.js
- Database: MySQL
- Hosting: Deployed using Virtual Machine on Google Cloud Platform

## Installation Prerequisites
- Node.js (v14.x or higher)
- MySQL
- Git

## Files Information
1. **`config/`**: This folder is typically used to store configuration files needed by the application, such as database settings, API configurations, or other settings that can be adjusted according to the environment (development, production, etc.).

2. **`controller/`**: This folder contains controller files responsible for handling the application's logic. Controllers receive requests from clients, process them (by calling model functions, for example), and return the appropriate responses.

3. **`models/`**: This folder contains data models that link the application with the database. Models usually define the data structure and interactions with tables in the database, such as CRUD operations (Create, Read, Update, Delete).

4. **`node_modules/`**: This is an automatically created folder by Node.js to store all project dependencies listed in `package.json`. This folder contains the packages and modules necessary to run the application.

5. **`routers/`**: This folder contains route definitions or URL paths that can be accessed within the application. Routers link specific URLs to the appropriate controller functions.

6. **Root Files (`app.js`, `index.js`, etc.)**:
   - **`app.js`**: Usually the main file of a Node.js application that initializes the server and middleware, and connects all routers.
   - **`index.js`**: This file is often used as the main entry point of the application. It typically initializes the server or performs initial tasks required when the application starts.

7. **`package.json`**: This file contains project metadata, including project name, version, author, dependencies (required Node.js modules), scripts for running tasks, and other settings.

8. .**`gitignore`**: `.gitignore` to exclude them from version control.

## Results
The server runs at http://localhost:3000.

Implementation, testing, and evaluation report can be accessed [here](https://drive.google.com/file/d/1jWIeYWFVokWX37NNMSWujeNdVezn4-jN/view?usp=sharing).

Full report of my final project can be accessed at [My Final Project Report](https://drive.google.com/file/d/1B80gTmp65oT_0TlowC-GYLj_FVs8BJre/view?usp=sharing).

## Contact

For any questions or feedback, feel free to reach out:
- Email: [zmichelleangelina@gmail.com](zmichelleangelina@gmail.com)
- LinkedIn: [Michelle Angelina](https://www.linkedin.com/in/mchelleangelina/)
