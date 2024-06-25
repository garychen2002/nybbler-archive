import { sequelize } from "../../datasource.ts"
import { DataTypes, Model } from "sequelize";

export class UserModel extends Model 
{
  public id!: number;
  public name!: string;
}

export const User = sequelize.define<UserModel>(
  "User",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }
);