const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');

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

// TMDB API থেকে হাজার হাজার রিয়েল মুভি ডাটাবেজে ফেচ করে সেভ করার রাউট
app.get('/api/scrape', async (req, res) => {
    try {
        let totalAdded = 0;
        // TMDB-এর ফ্রি পাবলিক পেজগুলো থেকে ট্রেন্ডিং মুভি ফেচ করা (একাধিক পেজ থেকে মুভি আনা যায়)
        for (let page = 1; page <= 5; page++) {
            const tmdbUrl = `https://api.themoviedb.org/3/trending/movie/day?api_key=c57701a2f64a2f8b50669255018610be&page=${page}`;
            const response = await axios.get(tmdbUrl);
            const results = response.data.results;

            for (let item of results) {
                const title = item.title || item.name;
                const poster = item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=500&q=80";
                // ডিফল্টভাবে ইউটিউব ট্রেলার বা সার্চ লিংক সেট করা
                const link = `https://www.youtube.com/results?search_query=${encodeURIComponent(title + " full movie")}`;

                if (title) {
                    const exists = await Movie.findOne({ title });
                    if (!exists) {
                        await Movie.create({ title, poster, link });
                        totalAdded++;
                    }
                }
            }
        }

        res.json({ success: true, message: `${totalAdded} new movies successfully loaded from TMDB into MongoDB!` });
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
