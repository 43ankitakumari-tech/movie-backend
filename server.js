const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

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

// প্রি-বিল্ড পপুলার মুভি ডেটা স্বয়ংক্রিয়ভাবে ডাটাবেজে যুক্ত করার রাউট
app.get('/api/scrape', async (req, res) => {
    try {
        const sampleMovies = [
            {
                title: "Hope (2026)",
                poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=500&q=80",
                link: "https://www.youtube.com/embed/dQw4w9WgXcQ"
            },
            {
                title: "Fall 2: Deadpoint",
                poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=80",
                link: "https://www.youtube.com/embed/dQw4w9WgXcQ"
            },
            {
                title: "Clayface",
                poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=500&q=80",
                link: "https://www.youtube.com/embed/dQw4w9WgXcQ"
            },
            {
                title: "Street Fighter",
                poster: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=500&q=80",
                link: "https://www.youtube.com/embed/dQw4w9WgXcQ"
            },
            {
                title: "Grey's Anatomy Series",
                poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=500&q=80",
                link: "https://www.youtube.com/embed/dQw4w9WgXcQ"
            },
            {
                title: "Animation World",
                poster: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=500&q=80",
                link: "https://www.youtube.com/embed/dQw4w9WgXcQ"
            }
        ];

        let count = 0;
        for (let movie of sampleMovies) {
            const exists = await Movie.findOne({ title: movie.title });
            if (!exists) {
                await Movie.create(movie);
                count++;
            }
        }

        res.json({ success: true, message: `${count} movies successfully loaded into MongoDB!` });
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
