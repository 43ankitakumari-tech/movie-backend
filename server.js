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

// ১. hdtoday.tv থেকে মুভি স্ক্র্যাপ করে ডাটাবেজে সেভ করার API
app.get('/api/scrape', async (req, res) => {
    try {
        const response = await axios.get('https://hdtoday.tv/home', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        const $ = cheerio.load(response.data);
        let count = 0;

        // hdtoday.tv এর মুভি কার্প বা আইটেম সিলেক্টর
        $('.flw-item').each(async (index, element) => {
            const title = $(element).find('.film-name a').text().trim();
            const poster = $(element).find('img').attr('data-src') || $(element).find('img').attr('src');
            const link = 'https://hdtoday.tv' + $(element).find('.film-name a').attr('href');

            if (title) {
                const exists = await Movie.findOne({ title });
                if (!exists) {
                    await Movie.create({ title, poster, link });
                    count++;
                }
            }
        });

        res.json({ success: true, message: `${count} new movies scraped from HDToday and saved to MongoDB!` });
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
