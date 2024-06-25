import { sequelize } from "../../datasource.ts"
import { DataTypes } from "sequelize";

export const User = sequelize.define(
  "User",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }
);