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

// ডাটাবেজে বিশাল কালেকশন অটো-সিডিং রাউট
app.get('/api/scrape', async (req, res) => {
    try {
        const moviesList = [
            { title: "Deadpool & Wolverine (2024)", poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=500&q=80", link: "https://www.youtube.com/embed/73_1biulkfk" },
            { title: "Inside Out 2", poster: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=500&q=80", link: "https://www.youtube.com/embed/LEjhY15eCx0" },
            { title: "Dune: Part Two", poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=80", link: "https://www.youtube.com/embed/Way9Dexny3w" },
            { title: "Avatar: The Way of Water", poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=80", link: "https://www.youtube.com/embed/d9MyW72ELq0" },
            { title: "Spider-Man: Across the Spider-Verse", poster: "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=500&q=80", link: "https://www.youtube.com/embed/cqGjhVJWtEg" },
            { title: "Oppenheimer", poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=500&q=80", link: "https://www.youtube.com/embed/uYPbbksJxIg" },
            { title: "Barbie", poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=500&q=80", link: "https://www.youtube.com/embed/pBk4NYhWNMM" },
            { title: "Interstellar", poster: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=500&q=80", link: "https://www.youtube.com/embed/zSWdZVtXT7E" },
            { title: "The Dark Knight", poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=500&q=80", link: "https://www.youtube.com/embed/EXeTwQWrcwY" },
            { title: "Inception", poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=80", link: "https://www.youtube.com/embed/YoHD9XEInc0" },
            { title: "Avengers: Endgame", poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=500&q=80", link: "https://www.youtube.com/embed/TcMBFSGVi1c" },
            { title: "John Wick: Chapter 4", poster: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=500&q=80", link: "https://www.youtube.com/embed/qEVUtrk8_B4" },
            { title: "Furiosa: A Mad Max Saga", poster: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=500&q=80", link: "https://www.youtube.com/embed/XJMuhwVlca4" },
            { title: "The Batman Part II", poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=500&q=80", link: "https://www.youtube.com/embed/mqqft2x_Ks4" },
            { title: "Stranger Things - Season 5", poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=500&q=80", link: "https://www.youtube.com/embed/b9EkMc79ZSU" },
            { title: "The Matrix Resurrections", poster: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=500&q=80", link: "https://www.youtube.com/embed/9ix7TUGVYIo" },
            { title: "Gladiator II", poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=500&q=80", link: "https://www.youtube.com/embed/4rgYUipGJNo" },
            { title: "Joker: Folie à Deux", poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=500&q=80", link: "https://www.youtube.com/embed/xy8aJw1vYHo" },
            { title: "Venom: The Last Dance", poster: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=500&q=80", link: "https://www.youtube.com/embed/__2bjWbetsA" },
            { title: "Mission: Impossible - Dead Reckoning", poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=500&q=80", link: "https://www.youtube.com/embed/NOhDysZOmoo" }
        ];

        let count = 0;
        for (let movie of moviesList) {
            const exists = await Movie.findOne({ title: movie.title });
            if (!exists) {
                await Movie.create(movie);
                count++;
            }
        }

        res.json({ success: true, message: `${count} movies successfully loaded into MongoDB database!` });
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
