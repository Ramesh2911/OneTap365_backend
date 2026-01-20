import app from './app.js';
import db from './db/db.js';

(async () => {
    try {
        const connection = await db.getConnection();
        console.log('Database connected successfully');
        connection.release();

        app.listen(process.env.PORT, () => {
            console.log(`Server running: http://localhost:${process.env.PORT}`);
        });
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
})();
