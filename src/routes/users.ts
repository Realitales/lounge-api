import express, { NextFunction, Request, Response } from "express";
import { genSalt, hash, compare } from "bcrypt";
import dotenv from "dotenv";
import { PrismaClient, User } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { generateToken } from "../utils/generateToken";

dotenv.config();
const prisma = new PrismaClient();

export const router = express.Router();

router.get("/", async (request: Request, response: Response) => {
  const allUser = await prisma.user.findMany();

  response.status(200).json(allUser);
});

router.post("/new-user", async (request: Request, response: Response) => {
  try {
    const salt = await genSalt();
    const hashedPassword = await hash(request.body.password, salt);
    await prisma.user.create({
      data: {
        ...request.body,
        id: uuidv4(),
        password: hashedPassword,
        created_at: new Date().toString(),
        last_online: "inactive",
      },
    });
    response.status(201).send({
      message: "User has been created successfully.",
      status: "success",
    });
  } catch ({ code }) {
    if (code === "P2002") {
      return response
        .status(403)
        .send({ message: "Username is already taken.", statusCode: "403" });
    }
    return response.status(501).send({
      message: "There's an error within the server.",
      statusCode: "501",
    });
  }
});

router.post("/login", async (request: Request, response: Response) => {
  try {
    const user: User | null = await prisma.user.findUnique({
      where: { username: request.body.username },
    });
    if (user) {
      if (await compare(request.body.password, user?.password)) {
        return response.status(200).json({
          message: "Login Successfully.",
          statusCode: 200,
          accessToken: generateToken({ user: user, option: "access" }),
        });
      }
      return response
        .status(403)
        .json({ message: "Wrong password or username", statusCode: 403 });
    }
    return response
      .status(404)
      .json({ message: "User does not exist.", statusCode: 404 });
  } catch (error) {
    console.log(error);
  }
});

router
  .route("/:id")
  .get(async (request: any, response: Response) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: request.params.id },
      });

      if (user) {
        return response.status(200).json(user);
      }

      return response
        .status(404)
        .json({ message: "User does not exist.", statusCode: 404 });
    } catch (error) {
      response.status(500).json({
        message: "There's an unexpected error within the server",
        statusCode: 500,
        error: error,
      });
    }
  })
  .put((request: any, response: Response) => {
    response.json(request.user);
  });

router.param(
  "id",
  (request: any, response: Response, next: NextFunction, id) => {
    next();
  }
);
