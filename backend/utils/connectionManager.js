class ConnectionManager {
    constructor() {
        this.users = new Set(); // Tracks all available users
        this.rooms = new Map(); // Tracks active rooms with their participants
    }

    /**
     * Adds a user to the pool of available users.
     * @param {string} userId - The ID of the user to add.
     */
    addUser(userId) {
        this.users.add(userId);
    }

    /**
     * Finds a random partner for the given user.
     * @param {string} userId - The ID of the user looking for a partner.
     * @returns {string|null} - The ID of the matched partner, or null if no partner is available.
     */
    findPartner(userId) {
        const availableUsers = [...this.users].filter(id => id !== userId);
        if (availableUsers.length === 0) return null;
        return availableUsers[Math.floor(Math.random() * availableUsers.length)];
    }

    /**
     * Creates a room for two users and assigns them a unique roomId.
     * @param {string} user1 - The ID of the first user.
     * @param {string} user2 - The ID of the second user.
     * @returns {string} - The unique roomId for the created room.
     */
    createRoom(user1, user2) {
        const roomId = `${user1}-${user2}`; // Generate a unique roomId

        // Add both users to the room map
        this.rooms.set(user1, { partner: user2, roomId });
        this.rooms.set(user2, { partner: user1, roomId });

        // Remove both users from the available users pool
        this.users.delete(user1);
        this.users.delete(user2);

        return roomId; // Return the roomId for reference
    }

    /**
     * Removes a user from the system and cleans up their room if applicable.
     * @param {string} userId - The ID of the user to remove.
     * @returns {Object|null} - The room information if the user was in a room, or null otherwise.
     */
    removeUser(userId) {
        this.users.delete(userId); // Remove the user from the available users pool

        const room = this.rooms.get(userId);
        if (room) {
            // Clean up the room by removing both users
            this.rooms.delete(userId);
            this.rooms.delete(room.partner);
        }

        return room; // Return the room information for cleanup purposes
    }
}

// Export the ConnectionManager class
export default ConnectionManager;

// class ConnectionManager {
//     constructor() {
//         this.users = new Set();
//         this.rooms = new Map();
//     }
//
//     addUser(userId) {
//         this.users.add(userId);
//     }
//
//     findPartner(userId) {
//         const availableUsers = [...this.users].filter(id => id !== userId);
//         if(availableUsers.length === 0) return null;
//         return availableUsers[Math.floor(Math.random() * availableUsers.length)];
//     }
//
//     createRoom(user1, user2) {
//         this.rooms.set(user1, { partner: user2 });
//         this.rooms.set(user2, { partner: user1 });
//         this.users.delete(user1);
//         this.users.delete(user2);
//     }
//
//     removeUser(userId) {
//         this.users.delete(userId);
//         const room = this.rooms.get(userId);
//         if(room) {
//             this.rooms.delete(userId);
//             this.rooms.delete(room.partner);
//         }
//         return room;
//     }
// }
//
// // module.exports = ConnectionManager;
// export default ConnectionManager;
