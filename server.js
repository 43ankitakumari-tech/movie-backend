const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB কানেকশন ইউআরআই
const mongoURI = process.env.MONGO_URI || "mongodb+srv://43ankitakumari_db_user:91sVxPdPqcZyOBUN@cluster0.mlydnrm.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("MongoDB Database Connected Successfully!"))
.catch((err) => console.log("Database Connection Error:", err));

const movieSchema = new mongoose.Schema({
    title: String,
    poster: String,
    link: String
});
const Movie = mongoose.model('Movie', movieSchema);

// টেস্ট স্ক্র্যাপ রাউট (example.com দিয়ে টেস্ট করার জন্য)
app.get('/api/scrape', async (req, res) => {
    try {
        // প্রথমে একটি সাধারণ ফ্রি সাইট বা example.com দিয়ে টেস্ট করছি
        const response = await axios.get('https://example.com');
        const $ = cheerio.load(response.data);
        
        // ডেমো হিসেবে একটি মুভি ডাটা সেভ করে টেস্ট করছি
        const testTitle = "Test Movie Example " + Date.now();
        const testPoster = "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=500&q=80";
        const testLink = "https://example.com";

        const exists = await Movie.findOne({ title: testTitle });
        if (!exists) {
            await Movie.create({ title: testTitle, poster: testPoster, link: testLink });
        }

        res.json({ success: true, message: `Test successful! Sample movie added to MongoDB.` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/movies', async (req, res) => {
    try {
        const movies = await Movie.find();
        res.json({ success: true, data: movies });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
