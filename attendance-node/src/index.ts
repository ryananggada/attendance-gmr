import cookieParser from 'cookie-parser';
import cors, { type CorsOptions } from 'cors';
import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import path from 'path';
import morgan from 'morgan';
import userRoute from './routes/user-route.js';
import attendanceRoute from './routes/attendance-route.js';
import authRoute from './routes/auth-route.js';
import departmentRoute from './routes/department-route.js';
import fieldAttendanceRoute from './routes/field-attendance-route.js';
import { __dirname } from './utils/path.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('json spaces', 2);
app.set('trust proxy', 1);

app.use(morgan('dev'));

const allowedOrigins = [
  'http://localhost:5173',
  'https://tugasgi.id',
  'https://www.tugasgi.id',
];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

const PORT = 8000;

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(cookieParser());

app.get('/api', (_req, res) => {
  res.send('Hello from Typescript Express!');
});

app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/attendances', attendanceRoute);
app.use('/api/departments', departmentRoute);
app.use('/api/field-attendances', fieldAttendanceRoute);

app.use('/images', express.static(path.join(__dirname, '../uploads')));

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
