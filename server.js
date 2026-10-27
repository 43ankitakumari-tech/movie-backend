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

// moviestvhd.com স্টাইলের জনপ্রিয় মুভি ও সিরিজ ডাটাবেজে যুক্ত করার রাউট
app.get('/api/scrape', async (req, res) => {
    try {
        const moviesList = [
            {
                title: "Deadpool & Wolverine (2024)",
                poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=500&q=80",
                link: "https://www.youtube.com/embed/73_1biulkfk"
            },
            {
                title: "Inside Out 2",
                poster: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=500&q=80",
                link: "https://www.youtube.com/embed/LEjhY15eCx0"
            },
            {
                title: "Dune: Part Two",
                poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=80",
                link: "https://www.youtube.com/embed/Way9Dexny3w"
            },
            {
                title: "Furiosa: A Mad Max Saga",
                poster: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=500&q=80",
                link: "https://www.youtube.com/embed/XJMuhwVlca4"
            },
            {
                title: "The Batman Part II",
                poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=500&q=80",
                link: "https://www.youtube.com/embed/mqqft2x_Ks4"
            },
            {
                title: "Stranger Things - Season 5",
                poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=500&q=80",
                link: "https://www.youtube.com/embed/b9EkMc79ZSU"
            }
        ];

        let count = 0;
        for (let movie of moviesList) {
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

app.get('/api/movies', async (res, resObj) => {
    try {
        const movies = await Movie.find();
        resObj.json({ success: true, data: movies });
    } catch (error) {
        resObj.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
