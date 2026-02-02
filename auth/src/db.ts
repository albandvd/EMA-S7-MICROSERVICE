import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'mot_de_passe',
    database: 'test_db',
});

export default pool;
    