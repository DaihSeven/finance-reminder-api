import app from "./app";
import { SchedulerService } from './services/SchedulerService'

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});

const scheduler = new SchedulerService()
scheduler.start()
