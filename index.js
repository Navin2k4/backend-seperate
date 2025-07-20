import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import eventRoutes from './routes/event.route.js';
import sequelize from './database.js';
import path from 'path';
import bcryptjs from 'bcryptjs';
import User from './models/user.model.js'; 

dotenv.config();

const __dirname = path.resolve();
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/event', eventRoutes);
app.use(express.static(path.join(__dirname, '/client/dist')));

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    statusCode,
    message
  });
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL connection established successfully.');
    await sequelize.sync(); 
    const adminEmail = process.env.ADMIN_EMAIL ;
    const adminPassword = process.env.ADMIN_PASSWORD ;

    const existingAdmin = await User.findOne({ where: { email: adminEmail } });

    if (!existingAdmin) {
      const hashedPassword = bcryptjs.hashSync(adminPassword, 10);

      await User.create({
        username: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        isAdmin: true,
      });

      console.log(`Admin created`);
    } else {
      console.log(`Admin exists`);
    }

  } catch (error) {
    console.error('Unable to connect or initialize admin user:', error.message);
  }
})();

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
