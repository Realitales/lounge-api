import express, { Express, Request, Response, json } from "express";
import { router as userRouter } from "./routes/users";
import dotenv from "dotenv";
import cors from "cors";

const port: number = 8000;
const app: Express = express();
app.use(cors());
dotenv.config();

app.use(json());

app.get("/", (request: Request, response: Response) => {
  response.send({ message: "Hello from the server" });
});

app.use("/users", userRouter);

app.listen(port);
