import { constraintSetSchema } from "@/lib/types/acs";
import { z } from "zod/v4";
import { resolve } from "path";
import fs from "fs";

const schemasFolder = resolve("./public/schemas");
const acsFile = resolve(schemasFolder, "acs.zod-schema.json");

const acs = z.toJSONSchema(constraintSetSchema);
fs.writeFileSync(acsFile, JSON.stringify(acs, null, 2));

console.log(JSON.stringify(acs, null, 2));
