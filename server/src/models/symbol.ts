import { sequelize } from "../../datasource.ts"
import { DataTypes } from "sequelize";
import { Binary } from "./binary.ts";

export const Symbol = sequelize.define(
    "Symbol",
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        namespace: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        source: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        timestamps: true,
    },
);

// BinaryId field available in Symbol for owner id
Symbol.belongsTo(Binary);
Binary.hasMany(Symbol, {onDelete: 'cascade'});