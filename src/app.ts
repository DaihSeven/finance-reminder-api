import express from "express";
import cors from "cors";
import swaggerUi from 'swagger-ui-express'
import { swaggerDocument } from './docs/swagger'
import { authRoutes } from "./routes/auth.routes"
import billRoutes from './routes/bill.routes'
import reportRoutes from './routes/report.routes'
import { userRoutes } from './routes/user.routes'
import { errorHandler } from './middlewares/errorHandler'

const app = express();

app.use(cors());
app.use(express.json());

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});
app.use('/v2/auth', authRoutes)
app.use('/v2/bills', billRoutes)
app.use('/v2/reports', reportRoutes)
app.use('/v2/users', userRoutes)

app.use(errorHandler)
export default app;
