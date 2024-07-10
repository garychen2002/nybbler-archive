import { sequelize } from "../../datasource.js";
import { AutomergeEntry } from "./automerge_entry.js";
import { Binary } from "./binary.js";
import { Invite } from "./invite.js";
import { Project } from "./project.js";
import { Symbol } from "./symbol.js";
import { User } from "./user.js";

export function initModels() {
  sequelize.addModels([AutomergeEntry, Binary, Invite, Project, Symbol, User]);
}
