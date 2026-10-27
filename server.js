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
    title: { type: String, unique: true },
    poster: String,
    link: String
});
const Movie = mongoose.model('Movie', movieSchema);

// অটোমেটিক হাজার হাজার মুভি TMDB থেকে ফেচ করে ডাটাবেজে ভরার রাউট
app.get('/api/scrape', async (req, res) => {
    try {
        let totalAdded = 0;
        let totalChecked = 0;

        // একবারে ১০টি পেজ লুপ চালিয়ে কয়েকশ/হাজার মুভি নিয়ে আসা (প্রতি পেজে ২০টি করে মুভি থাকে)
        for (let page = 1; page <= 10; page++) {
            try {
                // TMDB ফ্রি ডিসকভার API ব্যবহার করা হচ্ছে যা হাজার হাজার মুভির লিস্ট দেয়
                const tmdbUrl = `https://api.themoviedb.org/3/discover/movie?api_key=2c129e7104b2b36a18d18991ef2d8cc0&page=${page}&sort_by=popularity.desc`;
                const response = await axios.get(tmdbUrl);
                const movies = response.data.results;

                for (let item of movies) {
                    totalChecked++;
                    const title = item.title || item.original_title;
                    const poster = item.poster_path 
                        ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
                        : "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=500&q=80";
                    
                    // ইউটিউবে মুভির ট্রেলার বা ফুল মুভি খোঁজার ডাইরেক্ট লিংক জেনারেট করা
                    const link = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(title + " official trailer full movie")}`;

                    if (title) {
                        const exists = await Movie.findOne({ title });
                        if (!exists) {
                            await Movie.create({ title, poster, link });
                            totalAdded++;
                        }
                    }
                }
            } catch (pageError) {
                console.log(`Error on page ${page}:`, pageError.message);
            }
        }

        res.json({ 
            success: true, 
            message: `Auto-Sync Complete! Checked ${totalChecked} movies, added ${totalAdded} new movies to MongoDB.` 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// সমস্ত মুভি ফ্রন্টএন্ডে পাঠানোর API
app.get('/api/movies', async (req, res) => {
    try {
        const movies = await Movie.find().sort({ _id: -1 }); // নতুন মুভিগুলো আগে দেখাবে
        res.json({ success: true, count: movies.length, data: movies });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
