
import pool from '../db';
import bcrypt from  'bcrypt';
import jwt from 'jsonwebtoken';

export const healthCheck = () => {
    return {
        message: "App is running"
    };
};

export const login = async (body: { email: string; password: string }) => {
    const { email, password } = body;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        if (Array.isArray(rows) && rows.length > 0) {
            const user: any = rows[0];
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (isPasswordValid) {
                const token = jwt.sign({ id: user.id, email: user.email }, 'cle_secret', { expiresIn: '1h' });
                return { message: "Login successful", token };
            } else {
                return { message: "Invalid credentials" };
            }
        } else {
            return { message: "Invalid credentials" };
        }
    } catch (error) {
        return { message: "Database error", error };
    }
};

export const register = async (body: { email: string; password: string }) => {
    const { email, password } = body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO users (email, password) VALUES (?, ?)',
            [email, hashedPassword]
        );
        const token = jwt.sign({ id: (result as any).insertId, email: email }, 'cle_secret', { expiresIn: '1h' });
        return { message: "User registered successfully", token};
    } catch (error) {
        return { message: "Database error", error };
    }
};