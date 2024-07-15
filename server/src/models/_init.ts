import { sequelize } from "../../datasource.js";
import { AutomergeEntry } from "./automerge_entry.js";
import { Binary } from "./binary.js";
import { Function } from "./function.js";
import { Invite } from "./invite.js";
import { Project } from "./project.js";
import { Session } from "./session.js";
import { Symbol } from "./symbol.js";
import { User } from "./user.js";

export function initModels() {
  sequelize.addModels([AutomergeEntry, Binary, Function, Invite, Project, Session, Symbol, User]);
}
