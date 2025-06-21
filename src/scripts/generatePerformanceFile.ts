import { type ConstraintSet } from "@/lib/types/acs";
import { resolve } from "path";
import fs from "fs";

const RULES = 100;

const ruleSet: ConstraintSet = {
  name: "Der Performance Test",
  tags: ["performance"],
  scope: "object",

  transform: [
    {
      action: "allow-only",
      subject: "rotation",
      axes: ["y"],
    },
  ],

  placement: [],
};

const actionEnum = ["allow-only", "forbid"] as const;
const subjectEnum = ["distanceTo", "underground"] as const;

function randomEnum<T extends readonly string[]>(arr: T): T[number] {
  return arr[Math.floor(Math.random() * arr.length)];
}

const actionDistribution: Record<string, number> = {};

for (let i = 0; i < RULES; i++) {
  const rule = {
    action: randomEnum(actionEnum),
    subject: randomEnum(subjectEnum),
    tags: ["test", `rule-${i + 1}`],
    reason: `Test rule ${i + 1}`,
    reasonType: "atomic",
  };

  actionDistribution[rule.subject] =
    (actionDistribution[rule.subject] || 0) + 1;

  // @ts-expect-error generic type mismatch, but we control the input
  ruleSet.placement.push(rule);
}
const filePath = resolve("src/assets/constraints/performance-test.json");
fs.writeFileSync(filePath, JSON.stringify(ruleSet, null, 2));
console.log(
  `Generated performance test file with ${RULES} rules at ${filePath}`
);
console.log(`File size: ${(fs.statSync(filePath).size / 1024).toFixed(2)} KB`);

console.log("Action distribution:", actionDistribution);
