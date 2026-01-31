
import pool from '../db';
import bcrypt from  'bcrypt'

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
                return { message: "Login successful" };
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