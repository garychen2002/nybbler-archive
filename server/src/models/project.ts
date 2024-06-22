import { sequelize } from "../../datasource.ts"
import { DataTypes } from "sequelize";
import { User } from "./user.ts";

export const Project = sequelize.define(
  "Project",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    invitedIds: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    binaryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  },
);

//UserId field available in Project for owner id
Project.belongsTo(User);
User.hasMany(Project);