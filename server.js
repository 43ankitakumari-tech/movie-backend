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
.then(() => console.log("Advanced MongoDB Database Connected Successfully!"))
.catch((err) => console.log("Database Connection Error:", err));

const movieSchema = new mongoose.Schema({
    title: { type: String, unique: true, index: true },
    category: { type: String, default: "Action" },
    poster: String,
    link: String,
    rating: { type: String, default: "4.8" },
    year: { type: String, default: "2024" }
});
const Movie = mongoose.model('Movie', movieSchema);

// ১. অ্যাডভান্সড অটো-সিডিং রাউট (হাজার হাজার প্রিমিয়াম মুভি ও ক্যাটাগরি জেনারেটর)
app.get('/api/scrape', async (req, res) => {
    try {
        const categoriesData = [
            { cat: "Action", names: ["Extraction", "The Equalizer", "John Wick", "Gladiator", "Mad Max", "Die Hard", "Terminator", "The Matrix", "Top Gun", "Mission Impossible", "Fast X", "Bullet Train", "The Gray Man", "Red Notice", "Bad Boys", "The Covenant", "Beekeeper", "Civil War", "Furiosa", "Deadpool & Wolverine"] },
            { cat: "Sci-Fi", names: ["Interstellar", "Inception", "Dune: Part Two", "Blade Runner 2049", "Arrival", "The Martian", "Tenet", "Gravity", "Prometheus", "Edge of Tomorrow", "Avatar: The Way of Water", "Rogue One", "Pacific Rim", "Ready Player One", "Alita", "Transformers", "Moonfall", "Don't Look Up", "Prey", "The Creator"] },
            { cat: "Animation", names: ["Spider-Man: Across the Spider-Verse", "Inside Out 2", "The Super Mario Bros", "Puss in Boots: The Last Wish", "Elemental", "Toy Story 4", "Frozen II", "Moana 2", "Kung Fu Panda 4", "Minions", "Despicable Me 4", "Shrek", "Coco", "Encanto", "WALL-E", "Up", "Ratatouille", "The Incredibles", "Zootopia", "Big Hero 6"] },
            { cat: "Horror", names: ["A Quiet Place", "The Conjuring", "Insidious", "It", "Smile", "Bird Box", "The Nun", "Annabelle", "Hereditary", "M3GAN", "Talk to Me", "The Menu", "Split", "Glass", "Old", "The Black Phone", "Evil Dead Rise", "Scream VI", "Halloween Ends", "Knock at the Cabin"] },
            { cat: "Drama", names: ["Oppenheimer", "Barbie", "The Shawshank Redemption", "Forrest Gump", "The Godfather", "Fight Club", "The Dark Knight", "Schindler's List", "12 Years a Slave", "The Wolf of Wall Street", "Green Book", "La La Land", "Whiplash", "The Imitation Game", "A Beautiful Mind", "The Pursuit of Happyness", "Bohemian Rhapsody", "Ford v Ferrari", "The Social Network", "The Whale"] },
            { cat: "Series", names: ["Stranger Things", "Wednesday", "Squid Game", "Money Heist", "Breaking Bad", "Game of Thrones", "The Witcher", "Peacemaker", "The Mandalorian", "Loki", "Moon Knight", "The Boys", "Invincible", "Arcane", "Alice in Borderland", "All of Us Are Dead", "Dark", "Sherlock", "Prison Break", "Vikings"] }
        ];

        const posters = [
            "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=500&q=80"
        ];

        const trailers = [
            "https://www.youtube.com/embed/73_1biulkfk",
            "https://www.youtube.com/embed/LEjhY15eCx0",
            "https://www.youtube.com/embed/Way9Dexny3w",
            "https://www.youtube.com/embed/d9MyW72ELq0",
            "https://www.youtube.com/embed/cqGjhVJWtEg"
        ];

        let generatedMovies = [];
        let counter = 0;

        categoriesData.forEach(group => {
            group.names.forEach(name => {
                for (let year = 2018; year <= 2026; year++) {
                    let title = `${name} (${year})`;
                    if(group.cat === "Series") {
                        title = `${name} - Season 1 (${year})`;
                    }
                    
                    let poster = posters[counter % posters.length];
                    let link = trailers[counter % trailers.length];
                    let rating = (4.0 + (counter % 10) * 0.1).toFixed(1);

                    generatedMovies.push({ title, category: group.cat, poster, link, rating, year: year.toString() });
                    counter++;
                }
            });
        });

        let addedCount = 0;
        for (let movie of generatedMovies) {
            const exists = await Movie.findOne({ title: movie.title });
            if (!exists) {
                await Movie.create(movie);
                addedCount++;
            }
        }

        res.json({ 
            success: true, 
            message: `Advanced Auto-Sync Complete! Added ${addedCount} new movies into MongoDB.` 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ২. অ্যাডভান্সড মুভি ফেচিং API (Search, Category Filter ও Pagination সহ)
app.get('/api/movies', async (req, res) => {
    try {
        const { search, category, limit = 100, page = 1 } = req.query;
        let query = {};

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }
        if (category && category !== 'All') {
            query.category = category;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const movies = await Movie.find(query).sort({ _id: -1 }).skip(skip).limit(parseInt(limit));
        const total = await Movie.countDocuments(query);

        res.json({ 
            success: true, 
            total,
            count: movies.length, 
            data: movies 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Advanced Server is running on port ${PORT}`);
});
