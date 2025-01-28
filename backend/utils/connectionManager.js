class ConnectionManager {
    constructor() {
        this.users = new Set();
        this.rooms = new Map();
    }

    addUser(userId) {
        this.users.add(userId);
    }

    findPartner(userId) {
        const availableUsers = [...this.users].filter(id => id !== userId);
        if(availableUsers.length === 0) return null;
        return availableUsers[Math.floor(Math.random() * availableUsers.length)];
    }

    createRoom(user1, user2) {
        this.rooms.set(user1, { partner: user2 });
        this.rooms.set(user2, { partner: user1 });
        this.users.delete(user1);
        this.users.delete(user2);
    }

    removeUser(userId) {
        this.users.delete(userId);
        const room = this.rooms.get(userId);
        if(room) {
            this.rooms.delete(userId);
            this.rooms.delete(room.partner);
        }
        return room;
    }
}

// module.exports = ConnectionManager;
export default ConnectionManager;
