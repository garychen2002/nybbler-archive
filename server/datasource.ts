import { Sequelize } from "sequelize-typescript";

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "nybbler.sqlite",
});
