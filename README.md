# OC (Omegle Clone)

A web-based chat application inspired by Omegle, allowing users to connect and chat with random strangers online. Built with JavaScript, featuring a responsive design and real-time communication capabilities. Chat messages are stored in MongoDB in an unstructured format for flexibility and scalability.

## 🌟 Features

- Random user matching
- Real-time chat functionality
- Modern and responsive UI
- Firefox browser support
- Containerized deployment support
- Mobile-friendly interface
- Message persistence using MongoDB
- Unstructured data storage for flexible chat history

## 🚀 Tech Stack

- **Frontend:**
  - HTML5
  - CSS3
  - JavaScript
- **Styling:**
  - Custom CSS
- **Backend:**
  - Node.js
  - MongoDB (for message storage)
- **Infrastructure:**
  - Docker

## ⚠️ Browser Compatibility

Currently, this application is only supported on:
- Mozilla Firefox

Note: The application may not work correctly on Chromium-based browsers (Chrome, Edge, Opera, etc.).

## 🛠 Installation

### Prerequisites
- MongoDB installed and running
- Node.js
- Firefox browser
- Docker (optional)

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/MuhammadMahdiAmirpour/oc.git
   cd oc
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure MongoDB connection:
   - Ensure MongoDB is running locally
   - Update connection settings in your environment variables or configuration file

4. Start the development server:
   ```bash
   npm start
   ```

5. Open Firefox browser and navigate to `http://localhost:3000`

### Docker Deployment

1. Build the Docker image:
   ```bash
   docker build -t omegle-clone .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 omegle-clone
   ```

3. Access the application using Firefox at `http://localhost:3000`

## 💻 Usage

1. Open the application in Firefox web browser
2. Wait to be matched with a random user
3. Start chatting!
4. Press "Next" to skip the current chat and find a new partner
5. Chat messages are automatically saved to MongoDB

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
