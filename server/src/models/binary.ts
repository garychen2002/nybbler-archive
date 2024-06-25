import { sequelize } from "../../datasource.ts"
import { DataTypes } from "sequelize";
import { Project } from "./project.ts";

export const Binary = sequelize.define(
    "Binary",
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        file: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        symbols: { // file path to symbols.json
            type: DataTypes.STRING,
        }
    },
    {
        timestamps: true,
    },
);

//ProjectId field available in Binary for owner id
Binary.belongsTo(Project);
Project.hasMany(Binary, {onDelete: 'cascade'});