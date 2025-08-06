const express = require("express");
const cors = require("cors");
const admin = require("./firebaseAdmin");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Middleware to verify Firebase ID token
const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // "Bearer <token>"
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
        const decoded = await admin.auth().verifyIdToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Token verification failed:", error);
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};

app.get("/", (req, res) => {
    res.send("this is vishnu!");
});

app.get("/profile", verifyToken, (req, res) => {
    res.json({
        message: "Protected profile route!",
        user: req.user,
    });
});

app.get("/custom-token", async (req, res) => {
    const uid = req.query.uid;

    if (!uid) {
        return res.status(400).json({ error: "UID is required" });
    }

    try {
        const customToken = await admin.auth().createCustomToken(uid);
        res.json({ token: customToken });
    } catch (error) {
        console.error("Error creating custom token:", error);
        res.status(500).json({ error: "Failed to create custom token" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
