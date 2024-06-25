import { sequelize } from "../../datasource.ts"
import { DataTypes, Model } from "sequelize";
import { User } from "./user.ts";

class ProjectModel extends Model 
{
  public id!: number;
  public name!: string;
  public invitedIds!: string; //String representation of array
  public binaryIds!: string; //String representation of array
  public createdAt!: Date;
  public updatedAt!: Date;
}

export const Project = sequelize.define<ProjectModel>(
  "Project",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    invitedIds: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    binaryIds: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  },
);

//UserId field available in Project for owner id
Project.belongsTo(User);
User.hasMany(Project);