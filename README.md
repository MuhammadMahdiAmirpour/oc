# OC (Omegle Clone)

A web-based chat application inspired by Omegle, allowing users to connect and chat with random strangers online. Built with Express.js and EJS template engine, featuring a responsive design and real-time communication capabilities. Chat messages are stored in MongoDB in an unstructured format for flexibility and scalability.

## 🌟 Features

- Random user matching
- Real-time chat functionality
- Modern and responsive UI
- Firefox browser support
- Containerized deployment with Docker Compose
- Mobile-friendly interface
- Message persistence using MongoDB
- Server-side rendering with EJS templates
- RESTful API architecture using Express.js

## 🚀 Tech Stack

- **Frontend:**
  - HTML5
  - CSS3
  - JavaScript
  - EJS (Embedded JavaScript templates)
- **Backend:**
  - Node.js
  - Express.js
  - MongoDB (for message storage)
- **Styling:**
  - Custom CSS
- **Infrastructure:**
  - Docker
  - Docker Compose

## ⚠️ Browser Compatibility

Currently, this application is only supported on:
- Mozilla Firefox

Note: The application may not work correctly on Chromium-based browsers (Chrome, Edge, Opera, etc.).

## 🛠 Installation

### Prerequisites
- Docker and Docker Compose installed
- Firefox browser

### Using Docker Compose (Recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/MuhammadMahdiAmirpour/oc.git
   cd oc
   ```

2. Start the application using Docker Compose:
   ```bash
   docker compose up
   ```
   This will:
   - Build the application container
   - Start MongoDB container
   - Set up the required networking
   - Configure all necessary services

3. Access the application using Firefox at `http://localhost:3000`

To stop the application:
```bash
docker compose down
```

### Manual Development Setup

Only use this method if you want to develop or debug the application locally.

1. Ensure you have:
   - MongoDB installed and running
   - Node.js installed
   - Firefox browser

2. Clone the repository:
   ```bash
   git clone https://github.com/MuhammadMahdiAmirpour/oc.git
   cd oc
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Configure MongoDB connection:
   - Ensure MongoDB is running locally
   - Update connection settings in your environment variables or configuration file

5. Start the development server:
   ```bash
   npm start
   ```

## 💻 Usage

1. Open the application in Firefox web browser
2. Wait to be matched with a random user
3. Start chatting!
4. Press "Next" to skip the current chat and find a new partner
5. Chat messages are automatically saved to MongoDB

## 🔧 Project Structure

```
oc/
├── docker-compose.yml  # Docker Compose configuration
├── Dockerfile         # Docker container configuration
├── views/            # EJS templates
├── public/           # Static files (CSS, client-side JS)
├── routes/           # Express route handlers
├── models/           # MongoDB models
├── config/           # Configuration files
├── app.js            # Express application setup
└── package.json
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## ⚠️ Disclaimer

This is a clone project created for educational purposes. It is not affiliated with Omegle or its services.
