import { sequelize } from "../datasource.js";
import { initModels } from "../src/models/_init.js";
import { User } from "../src/models/user.js";

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
