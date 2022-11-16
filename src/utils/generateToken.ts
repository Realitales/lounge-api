import { Secret, sign } from "jsonwebtoken";

const accessTokenSecret: Secret = process.env.ACCESS_TOKEN_SECRET || "";
const refreshTokenSecret: Secret = process.env.REFRESH_TOKEN_SECRET || "";

export const generateToken = ({
  user,
  option,
}: {
  user: object;
  option: string;
}) => {
  return sign(
    user,
    option === "access" ? accessTokenSecret : refreshTokenSecret
  );
};
