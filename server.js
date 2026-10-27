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
    title: { type: String, unique: true },
    poster: String,
    link: String
});
const Movie = mongoose.model('Movie', movieSchema);

// ডাটাবেজে ১০০০+ ইউনিক মুভি ও এইচডি থাম্বনেইল অটো-লোডিং রাউট
app.get('/api/scrape', async (req, res) => {
    try {
        const categories = [
            { prefix: "Action: ", names: ["Extraction", "The Equalizer", "John Wick", "Gladiator", "Mad Max", "Die Hard", "Terminator", "The Matrix", "Top Gun", "Mission Impossible", "Fast X", "Bullet Train", "The Gray Man", "Red Notice", "Bad Boys", "The Covenant", "Beekeeper", "Civil War", "Furiosa", "Deadpool & Wolverine"] },
            { prefix: "Sci-Fi: ", names: ["Interstellar", "Inception", "Dune: Part Two", "Blade Runner 2049", "Arrival", "The Martian", "Tenet", "Gravity", "Prometheus", "Edge of Tomorrow", "Avatar: The Way of Water", "Rogue One", "Pacific Rim", "Ready Player One", "Alita", "Transformers", "Moonfall", "Don't Look Up", "Prey", "The Creator"] },
            { prefix: "Animation: ", names: ["Spider-Man: Across the Spider-Verse", "Inside Out 2", "The Super Mario Bros", "Puss in Boots: The Last Wish", "Elemental", "Toy Story 4", "Frozen II", "Moana 2", "Kung Fu Panda 4", "Minions", "Despicable Me 4", "Shrek", "Coco", "Encanto", "WALL-E", "Up", "Ratatouille", "The Incredibles", "Zootopia", "Big Hero 6"] },
            { prefix: "Horror & Thriller: ", names: ["A Quiet Place", "The Conjuring", "Insidious", "It", "Smile", "Bird Box", "The Nun", "Annabelle", "Hereditary", "M3GAN", "Talk to Me", "The Menu", "Split", "Glass", "Old", "The Black Phone", "Evil Dead Rise", "Scream VI", "Halloween Ends", "Knock at the Cabin"] },
            { prefix: "Drama & Biography: ", names: ["Oppenheimer", "Barbie", "The Shawshank Redemption", "Forrest Gump", "The Godfather", "Fight Club", "The Dark Knight", "Schindler's List", "12 Years a Slave", "The Wolf of Wall Street", "Green Book", "La La Land", "Whiplash", "The Imitation Game", "A Beautiful Mind", "The Pursuit of Happyness", "Bohemian Rhapsody", "Ford v Ferrari", "The Social Network", "The Whale"] },
            { prefix: "Series: ", names: ["Stranger Things - Season", "Wednesday - Season", "Squid Game - Season", "Money Heist - Season", "Breaking Bad - Season", "Game of Thrones - Season", "The Witcher - Season", "Peacemaker - Season", "The Mandalorian - Season", "Loki - Season", "Moon Knight - Season", "The Boys - Season", "Invincible - Season", "Arcane - Season", "Alice in Borderland - Season", "All of Us Are Dead - Season", "Dark - Season", "Sherlock - Season", "Prison Break - Season", "Vikings - Season"] }
        ];

        // বিভিন্ন ধরনের আকর্ষণীয় এইচডি মুভি পোস্টার
        const posters = [
            "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=500&q=80"
        ];

        const trailers = [
            "https://www.youtube.com/embed/73_1biulkfk",
            "https://www.youtube.com/embed/LEjhY15eCx0",
            "https://www.youtube.com/embed/Way9Dexny3w",
            "https://www.youtube.com/embed/d9MyW72ELq0",
            "https://www.youtube.com/embed/cqGjhVJWtEg",
            "https://www.youtube.com/embed/uYPbbksJxIg",
            "https://www.youtube.com/embed/pBk4NYhWNMM",
            "https://www.youtube.com/embed/zSWdZVtXT7E",
            "https://www.youtube.com/embed/EXeTwQWrcwY",
            "https://www.youtube.com/embed/YoHD9XEInc0"
        ];

        let generatedMovies = [];
        let counter = 0;

        // বিভিন্ন কম্বিনেশন তৈরি করে ১০০০+ মুভি জেনারেট করা
        categories.forEach(cat => {
            cat.names.forEach(name => {
                for (let year = 2015; year <= 2026; year++) {
                    let title = `${name} (${year})`;
                    if(cat.prefix.includes("Series")) {
                        title = `${name} 1 (${year})`;
                    }
                    
                    let poster = posters[counter % posters.length];
                    let link = trailers[counter % trailers.length];

                    generatedMovies.push({ title, poster, link });
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
            message: `Successfully generated and added ${addedCount} new unique movies into MongoDB!` 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// সমস্ত মুভি ফ্রন্টএন্ডে পাঠানোর API
app.get('/api/movies', async (req, res) => {
    try {
        const movies = await Movie.find().sort({ _id: -1 });
        res.json({ success: true, count: movies.length, data: movies });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
