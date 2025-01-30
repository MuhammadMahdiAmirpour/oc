import mongoose from 'mongoose';

// Define the schema for chat messages
const chatMessageSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true, // The room ID to associate the message with a specific chat room
    },
    senderId: {
        type: String,
        required: true, // The ID of the user who sent the message
    },
    message: {
        type: String,
        required: true, // The actual chat message
    },
    timestamp: {
        type: Date,
        default: Date.now, // Automatically set the timestamp when the message is created
    },
}, { collection: 'chatMessages' }); // Explicitly set the collection name

// Create and export the model
const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
export default ChatMessage;