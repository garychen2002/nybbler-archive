import { Sequelize } from "sequelize-typescript";

// https://sequelize.org/docs/v6/getting-started/#connecting-to-a-database
export const sequelize = process.env.POSTGRES_URL
  ? new Sequelize(process.env.POSTGRES_URL)
  : new Sequelize({
      dialect: "sqlite",
      storage: "nybbler.sqlite",
    });
