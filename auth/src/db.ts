import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: 'user-db',
    port: 3306,
    user: 'root',
    password: 'password',
    database: 'user_db',
});

export default pool;
    