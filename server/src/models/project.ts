import { sequelize } from "../../datasource.ts"
import { DataTypes, Model } from "sequelize";
import { User, UserModel } from "./user.ts";

class ProjectModel extends Model 
{
  public id!: number;
  public name!: string;
  public createdAt!: Date;
  public updatedAt!: Date;

  public addUser!: (user: UserModel) => Promise<void>;
  public removeUser!: (user: UserModel) => Promise<void>;
  public getUsers!: () => Promise<UserModel[]>;
}

export const Project = sequelize.define<ProjectModel>(
  "Project",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  },
  {
    timestamps: true,
  },
);

//UserId field available in Project for owner id
Project.belongsTo(User);
User.hasMany(Project);
User.belongsToMany(Project, { through: 'Invites' });
Project.belongsToMany(User, { through: 'Invites' });