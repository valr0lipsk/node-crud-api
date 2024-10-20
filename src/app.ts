import express, { Express, Request, Response, NextFunction } from "express";
// import userRoutes from './routes/user.routes';

const app: Express = express();

app.use(express.json());

// app.use('/api/users', userRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Resource not found" });
});

app.use(
  (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal server error" });
  }
);

export default app;
