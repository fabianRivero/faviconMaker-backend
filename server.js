import "dotenv/config";
import app from './app.js';

const host = "localhost";
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`server is running on http://${host}:${port}`);
});