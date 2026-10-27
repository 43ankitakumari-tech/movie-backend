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

// ফ্রি API বা সার্চ সোর্স থেকে অটোমেটিক শত শত মুভি ডাটাবেজে সেভ করার রাউট
app.get('/api/scrape', async (req, res) => {
    try {
        let totalAdded = 0;
        
        // জনপ্রিয় মুভিগুলোর কিছু কিওয়ার্ড বা ক্যাটাগরি যা দিয়ে অটো সার্চ করা হবে
        const searchQueries = [
            "Action", "Marvel", "Avengers", "Batman", "Spider", "Fast", 
            "Avatar", "John Wick", "Matrix", "Transformer", "Star", 
            "Jurassic", "Mission", "Hobbit", "Lord", "Panda", "Frozen",
            "Doctor", "Thor", "Superman", "Flash", "Venom", "Deadpool"
        ];

        for (let query of searchQueries) {
            try {
                // Free IMDb/Movie Database API ব্যবহার করে ডেটা আনা (কোনো API Key ছাড়াই)
                const apiUrl = `https://imdb.iamidiotareyoutoo.com/search?q=${encodeURIComponent(query)}`;
                const response = await axios.get(apiUrl);
                
                if (response.data && response.data.description) {
                    const items = response.data.description;

                    for (let item of items) {
                        const title = item['#TITLE'];
                        const poster = item['#IMG_POSTER'] || "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=500&q=80";
                        const imdbId = item['#IMDB_ID'];
                        
                        // ইউটিউব বা স্ট্রিম করার ডাইরেক্ট লিংক তৈরি
                        const link = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(title + " official trailer full movie")}`;

                        if (title) {
                            const exists = await Movie.findOne({ title });
                            if (!exists) {
                                await Movie.create({ title, poster, link });
                                totalAdded++;
                            }
                        }
                    }
                }
            } catch (err) {
                console.log(`Skipped query ${query}:`, err.message);
            }
        }

        res.json({ 
            success: true, 
            message: `Auto-Sync Successful! Added ${totalAdded} new movies into MongoDB from Free Movie Database.` 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// সমস্ত মুভি ফ্রন্টএন্ডে পাঠানোর API
app.get('/api/movies', async (req, res) => {
    try {
        const movies = await Movie.find().sort({ _id: -1 }); // নতুন মুভিগুলো সবার আগে দেখাবে
        res.json({ success: true, count: movies.length, data: movies });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
