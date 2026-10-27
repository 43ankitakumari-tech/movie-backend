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

// hdtoday.tv থেকে রিয়েল মুভি স্ক্র্যাপ করার API
app.get('/api/scrape', async (req, res) => {
    try {
        // হেডার যুক্ত করে রিকোয়েস্ট পাঠানো যাতে ব্রাউজারের মতো আচরণ করে
        const response = await axios.get('https://hdtoday.tv/home', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://hdtoday.tv/'
            }
        });

        const $ = cheerio.load(response.data);
        let count = 0;

        // hdtoday.tv এর মুভি আইটেম সিলেক্টর
        $('.flw-item').each(async (index, element) => {
            const title = $(element).find('.film-name a').text().trim();
            const poster = $(element).find('img').attr('data-src') || $(element).find('img').attr('src');
            const link = $(element).find('.film-name a').attr('href');
            
            const fullLink = link ? (link.startsWith('http') ? link : 'https://hdtoday.tv' + link) : 'https://hdtoday.tv';

            if (title) {
                const exists = await Movie.findOne({ title });
                if (!exists) {
                    await Movie.create({ 
                        title, 
                        poster: poster || "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=500&q=80", 
                        link: fullLink 
                    });
                    count++;
                }
            }
        });

        res.json({ success: true, message: `${count} new movies successfully scraped from hdtoday.tv and saved to MongoDB!` });
    } catch (error) {
        // কোনো কারণে স্ক্র্যাপিং ব্লক হলে ফলব্যাক হিসেবে যেন কিছু মুভি সেভ হয়ে যায়
        res.status(500).json({ success: false, error: "Scraping blocked by target site protection. Please try again or use direct API.", details: error.message });
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
