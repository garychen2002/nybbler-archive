import { sequelize } from "../datasource.ts";
import { initModels } from "../src/models/_init.ts";
import { Invite } from "../src/models/invite.ts";
import { Project } from "../src/models/project.ts";
import { User } from "../src/models/user.ts";

await sequelize.authenticate();
console.log("Connection has been established successfully.");

initModels();
await sequelize.dropAllSchemas({});
await sequelize.sync({ alter: { drop: true } });

await User.bulkCreate([
  {
    id: 1,
    name: "Alice",
    email: "alice@example.com",
  },
  {
    id: 2,
    name: "Bob",
    email: "bob@example.com",
  },
] as any);

await Project.bulkCreate([
  {
    id: 1,
    name: "Project One",
  },
  {
    id: 2,
    name: "Project Two",
  },
  {
    id: 3,
    name: "Project Three",
  },
] as any);

await Invite.bulkCreate([
  {
    userId: 1,
    projectId: 1,
  },
  {
    userId: 1,
    projectId: 2,
  },
  {
    userId: 1,
    projectId: 3,
  },
  {
    userId: 2,
    projectId: 1,
  },
  {
    userId: 2,
    projectId: 2,
  },
  {
    userId: 2,
    projectId: 3,
  },
] as any);
