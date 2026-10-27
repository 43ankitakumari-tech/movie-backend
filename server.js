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

// ডাটাবেজে ১০০০+ মুভি ও থাম্বনেইল অটো-লোডিং রাউট
app.get('/api/scrape', async (req, res) => {
    try {
        const baseTitles = [
            "Avatar", "Avengers", "Batman", "Spider-Man", "Superman", "Iron Man", "Thor", "Doctor Strange",
            "Deadpool", "Wolverine", "Guardians of the Galaxy", "Black Panther", "Ant-Man", "Captain America",
            "John Wick", "Matrix", "Fast & Furious", "Transformers", "Star Wars", "Jurassic Park",
            "Mission Impossible", "James Bond", "Indiana Jones", "Pirates of the Caribbean", "Gladiator",
            "Interstellar", "Inception", "The Dark Knight", "Oppenheimer", "Barbie", "Dune", "Joker",
            "Venom", "Aquaman", "Wonder Woman", "Flash", "Shazam", "Black Adam", "Extraction", "The Gray Man",
            "Red Notice", "Army of the Dead", "Bullet Train", "Free Guy", "Jungle Cruise", "Cruella", "Mulan",
            "Aladdin", "Lion King", "Frozen", "Moana", "Toy Story", "Minions", "Despicable Me", "Shrek",
            "Kung Fu Panda", "How to Train Your Dragon", "Spider-Verse", "Puss in Boots", "The Super Mario Bros",
            "Inside Out", "Elemental", "Encanto", "Coco", "Up", "WALL-E", "Ratatouille", "The Incredibles",
            "Stranger Things", "Wednesday", "Squid Game", "Money Heist", "Breaking Bad", "Game of Thrones",
            "The Witcher", "Peacemaker", "The Mandalorian", "Loki", "Moon Knight", "Hawkeye", "WandaVision",
            "The Boys", "Invincible", "Arcane", "Cyberpunk", "Alice in Borderland", "All of Us Are Dead",
            "Titanic", "Gladiator", "Avatar", "Terminator", "Alien", "Predator", "Die Hard", "Rocky", "Rambo",
            "The Lord of the Rings", "The Hobbit", "Harry Potter", "Fantastic Beasts", "Chronicles of Narnia"
        ];

        let generatedMovies = [];
        let highQualityPosters = [
            "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=500&q=80"
        ];

        let videoLinks = [
            "https://www.youtube.com/embed/73_1biulkfk",
            "https://www.youtube.com/embed/LEjhY15eCx0",
            "https://www.youtube.com/embed/Way9Dexny3w",
            "https://www.youtube.com/embed/d9MyW72ELq0",
            "https://www.youtube.com/embed/cqGjhVJWtEg",
            "https://www.youtube.com/embed/uYPbbksJxIg",
            "https://www.youtube.com/embed/pBk4NYhWNMM",
            "https://www.youtube.com/embed/zSWdZVtXT7E",
            "https://www.youtube.com/embed/EXeTwQWrcwY",
            "https://www.youtube.com/embed/YoHD9XEInc0",
            "https://www.youtube.com/embed/TcMBFSGVi1c",
            "https://www.youtube.com/embed/qEVUtrk8_B4"
        ];

        // ১০০০+ ইউনিক মুভি কম্বিনেশন তৈরি করার লুপ
        let counter = 1;
        for (let base of baseTitles) {
            for (let i = 1; i <= 12; i++) {
                let suffix = i === 1 ? "" : ` (Season ${i})`;
                let year = 2010 + (i % 15);
                let title = `${base} ${i > 1 ? i : ''} [${year}]${suffix}`.trim();
                let poster = highQualityPosters[(counter + i) % highQualityPosters.length];
                let link = videoLinks[(counter + i) % videoLinks.length];

                generatedMovies.push({ title, poster, link });
                counter++;
            }
        }

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
            message: `Successfully generated and added ${addedCount} new movies into MongoDB database!` 
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
