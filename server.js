const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Use the password from environment variables, or fallback to default
const CLIENT_PASSWORD = process.env.CLIENT_PASSWORD || 'client123';

// Bank details stored securely on the server
const bankDetails = {
    bankName: "Dutch Bangla Bank",
    acNumber: "1201580374514",
    firstName: "MST POLY",
    lastName: "KHATUN",
    swiftCode: "DBBLBDDH",
    branchCode: "120",
    routingNo: "090471544",
    country: "Bangladesh",
    city: "Khulna",
    postcode: "9000",
    branch: "Khulna",
    email: "minzu.bd.123@gmail.com",
    address: "Holding 26,1, Road Goyalkhali, Boyra, Stamp Khulna GPO"
};

app.use(cors());
app.use(express.json());

// Serve static HTML/CSS/JS files from this directory
app.use(express.static(path.join(__dirname, '')));

// Secure API Endpoint to verify password and get bank details
app.post('/api/bank-details', (req, res) => {
    const { password } = req.body;

    if (password === CLIENT_PASSWORD) {
        // Success
        res.status(200).json({
            success: true,
            data: bankDetails
        });
    } else {
        // Unauthorized
        res.status(401).json({
            success: false,
            message: "Incorrect password"
        });
    }
});

// Fallback to index.html for any other route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
