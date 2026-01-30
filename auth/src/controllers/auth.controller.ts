
import pool from '../db';
import bcrypt from  'bcrypt'

export const healthCheck = () => {
    return {
        message: "App is running"
    };
};

export const login = async (body: { username: string; password: string }) => {
    const { username, password } = body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE email = ? AND password = ?',
            [username, hashedPassword]
        );
        if (Array.isArray(rows) && rows.length > 0) {
            return { message: "Login successful" };
        } else {
            return { message: "Invalid credentials" };
        }
    } catch (error) {
        return { message: "Database error", error };
    }
};