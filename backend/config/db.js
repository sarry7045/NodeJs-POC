// const fs = require("fs");
// const path = require("path");

// // Path to the database file
// const filePath = path.join(__dirname, "database.json");


// Function to read the database file
const fs = require("fs");
const path = require("path");

// const dbFilePath = path.join(__dirname, "database.json");
// const dbFilePath = "../database.json";
const dbFilePath = path.join(__dirname, "..", "config", "database.json");


const readDatabase = () => {
    try {
        const data = fs.readFileSync(dbFilePath, "utf-8");
        
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading database:", error);
        return { users: [] };  // Return empty object if file doesn't exist
    }
};

const writeDatabase = (db) => {
    try {
        fs.writeFileSync(dbFilePath, JSON.stringify(db, null, 2));
    } catch (error) {
        console.error("Error writing to database:", error);
    }
};


// module.exports = { readDatabase, writeDatabase };

// Register User
function getUsers() {
    try {
        const data = fs.readFileSync(dbFilePath, "utf8");
        const jsonData = JSON.parse(data);
        return jsonData.users || []; // Ensure 'users' key exists in JSON
    } catch (error) {
        console.log("Error reading database file:", error);
        return []; // Return empty array if file doesn't exist or is corrupted
    }
}

// Function to save users back to JSON file
function saveUsers(users) {
    try {
        const data = { users }; // Ensure users are saved under 'users' key
        fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.log("Error saving database file:", error);
    }
}

// Register User function
async function registerUser(username, password) {
    const users = getUsers(); // Get users from file

    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return { success: false, error: "User already exists" };
    }

    // Add new user
    const newUser = { username, password };
    users.push(newUser);
    saveUsers(users); // Save updated users list

    return { success: true };
}


// Login User
const loginUser = async (username, password) => {
    const db = readDatabase();
    // const user = db.users.find(user => user.username === username && user.password === password);
    const user = db.users.find(user => user.username === username);
if (!user || !(await bcrypt.compare(password, user.password))) {
    return { success: false, error: "Invalid credentials" };
}


    if (user) {
        return { success: true };
    } else {
        return { success: false, error: "Invalid credentials" };
    }
};

module.exports = { registerUser, loginUser, readDatabase, writeDatabase };