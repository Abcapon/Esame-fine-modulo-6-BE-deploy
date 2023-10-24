// "import" di express e mongoose
const express = require(`express`);
const mongoose = require(`mongoose`);

// impostazione delle "rotta" ad esempio importo il file post.js; (se avrò altre rotte le inserirò sotto questa)
const authorsRoute = require(`./routes/authors`);
const postsRoute = require(`./routes/posts`);
const commentsRoute = require(`./routes/comments`);
const emailRoute = require(`./routes/sendEmail`);
const loginRoute = require(`./routes/login`);
const githubRoute = require(`./routes/github`);
//const validateRoute = require(`./routes/verify`);

//importazione cors
const cors = require(`cors`);
//importazione variabile globale url
require(`dotenv`).config();

// middleware path
const path = require(`path`);

// dichiarazione della porta da utilizzare per comunicare con il DB
const PORT = 5050;

// dichiarazione di app per poter utilizzare i metodi di express
const app = express();

// uso middleware path (dichiarazione della folder di destinazione)
app.use(`/public`, express.static(path.join(__dirname, `public`)));
//uso cors
app.use(cors());
// middleware = parse json
app.use(express.json());

// middleware (uso del file posts)
app.use(`/`, authorsRoute);
app.use(`/`, postsRoute);
app.use(`/`, commentsRoute);
app.use(`/`, emailRoute);
app.use(`/`, loginRoute);
app.use(`/`, githubRoute);
//app.use(`/`, validateRoute);

// connessione al server (vedi documentazione mongoose)
mongoose.connect(process.env.MONGODB_URL, {
	// parametri da inserire come da documentazione
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

// gestione dei messaggi di connessione al server mongoose
const db = mongoose.connection;
db.on(`error`, console.error.bind(console, `Error during db connection`));
db.once(`open`, () => {
	console.log(`Database successfully connected!`);
});

// dichiarazione del "listen" (evento che dovrà "osservare" app)
app.listen(PORT, () => console.log(`Server up and running on port ${PORT}`));
