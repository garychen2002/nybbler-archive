import { sequelize } from "../../datasource.ts";
import { Binary } from "./binary.ts";
import { Invite } from "./invite.ts";
import { Project } from "./project.ts";
import { User } from "./user.ts";

export function initModels() {
  sequelize.addModels([Binary, Invite, Project, User]);
}
