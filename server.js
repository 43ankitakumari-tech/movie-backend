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

// ডাটাবেজ কানেক্ট করার কোড
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("MongoDB Database Connected Successfully!"))
.catch((err) => console.log("Database Connection Error:", err));

// মুভি সেভ করার স্কিমা এবং মডেল
const movieSchema = new mongoose.Schema({
    title: String,
    poster: String,
    link: String
});
const Movie = mongoose.model('Movie', movieSchema);

// ১. watch.plex.tv থেকে মুভি স্ক্র্যাপ করে ডাটাবেজে সেভ করার API
app.get('/api/scrape', async (req, res) => {
    try {
        const response = await axios.get('https://watch.plex.tv/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        const $ = cheerio.load(response.data);
        let count = 0;

        // Plex সাইটের মুভি কার্ড বা এলিমেন্ট সিলেক্টর
        $('a').each(async (index, element) => {
            const href = $(element).attr('href');
            const title = $(element).attr('title') || $(element).find('img').attr('alt');
            const poster = $(element).find('img').attr('src');

            // Plex-এর মুভি লিঙ্কের প্যাটার্ন চেক করা
            if (href && href.includes('/movies/') && title) {
                const link = href.startsWith('http') ? href : 'https://watch.plex.tv' + href;
                
                const exists = await Movie.findOne({ title });
                if (!exists) {
                    await Movie.create({ title, poster: poster || "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=500&q=80", link });
                    count++;
                }
            }
        });

        res.json({ success: true, message: `${count} new movies scraped from Plex and saved to MongoDB!` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ২. ডাটাবেজ থেকে মুভিগুলো ফ্রন্টএন্ডে পাঠানোর API
app.get('/api/movies', async (req, res) => {
    try {
        const movies = await Movie.find();
        res.json({ success: true, data: movies });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
