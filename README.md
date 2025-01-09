# Project 7: FreeShare

By: Zakaria Almardaee, Alan Tuecci, Raisa Methila 
## Product Vision
**Product Name**: FreeShare


FreeShare is a skill-sharing volunteering platform that enables volunteers to create detailed profiles showcasing their skills and interests. Nonprofits and organizations can create profiles and post opportunities tailored to their specific needs, such as required skills, location, and time commitment.

### Key Features:
- Volunteers can browse a list of available opportunities or search using filters based on skills, location (remote or in-person), or causes they are passionate about.
- Nonprofits can post opportunities and search for volunteers with specific skills.
- The platform ensures that volunteers are connected to roles that align with their expertise and preferences while helping organizations efficiently fill their needs.

## Project Structure
- **Frontend**: Detailed information can be found in the [Frontend README](frontend/README.md).
- **Backend**: Detailed information can be found in the [Backend README](backend/README.md).

## Setup Instructions
For detailed setup and running instructions for both the frontend and backend, refer to their respective README files.

### Important Qualities
- **Security and Performance**: Ensures that all users experience smooth, fast, and secure access.
- **Product Lifetime**: Designed to support continuous updates and adaptability.
- **Software Reuse**: The architecture supports reuse of shared services such as authentication and data storage.
- **Scalability**: Our design considers scalability to accommodate varying numbers of users effectively.

### Layered Architecture
1. **User Interface**: The front-facing layer that users interact with, accessible through a web browser.
2. **User Interface Management**: Manages user-related actions like login, registration, and handling forms.
3. **Application Services**: Contains core functionalities, including volunteer management, event creation, and profile management.
4. **Information Retrieval**: Facilitates efficient lookup for events, organizations, and volunteers, ensuring relevant data is easily accessible.
5. **Shared Services**: Manages reusable services like profile management and authentication for both users and organizations.
6. **Shared Infrastructure Services**: Provides core infrastructure with JWT-based authentication for security and MongoDB for data storage.

### Architecture Diagram
![Architecture Diagram](frontend/src/media/Arch-diagram.jpeg) 
- **User Interface**: Web-based (with potential mobile support in the future)
- **User Interface Management**: Manages user interactions such as login, registration, and form submissions.
- **Application Services**: Includes volunteer management, event creation, and profile management.
- **Information Retrieval**: Supports event, organization, and volunteer lookup functionalities.
- **Shared Services**: Covers profile management and authentication.
- **Shared Infrastructure Services**: Uses JWT for secure authentication and MongoDB for efficient data storage.


### Technology Choices
- **Database**: MongoDB for its flexibility in handling NoSQL data.
- **Platform**: Accessible as a web application.
- **Server**: Deployed on AWS for scalable cloud hosting.
- **Open-Source Tools**: React and Flask frameworks.
- **Development Tools**: GitHub, and Github Actions



## Docker Instructions

### Backend
docker pull raisa28/backend-app:latest
docker run -p 5000:5000 raisa28/backend-app:latest

### Frontend
docker pull raisa28/frontend-app:latest
docker run -p 3000:3000 raisa28/frontend-app:latest


