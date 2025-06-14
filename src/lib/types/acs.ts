import { z } from "zod/v4";

export const actionEnum = z.enum(["allow-only", "forbid", "require"]);

export const rotationAxes = z.array(z.enum(["x", "y", "z"])).min(1);

const rotationRule = z
  .object({
    action: actionEnum,
    subject: z.literal("rotation"),
    axes: rotationAxes, // required
    min: z.number().optional(),
    max: z.number().optional(),
    active: z.boolean().optional(),
  })
  .strict();

const scaleBetweenTuple = z
  .tuple([z.number().positive(), z.number().positive()])
  .refine(([lo, hi]) => lo <= hi, {
    message: "`between` lower bound must be ≤ upper bound",
  });

const scaleRule = z
  .object({
    action: actionEnum,
    subject: z.literal("scale"),
    between: scaleBetweenTuple,
    min: z.number().optional(),
    max: z.number().optional(),
    active: z.boolean().optional(),
  })
  .strict();

const positionRule = z
  .object({
    action: actionEnum,
    subject: z.literal("position"),
    min: z.number().optional(),
    max: z.number().optional(),
    active: z.boolean().optional(),
  })
  .strict();

export const transformRule = z.discriminatedUnion("subject", [
  rotationRule,
  scaleRule,
  positionRule,
]);

export const placementRule = z.object({
  action: actionEnum,
  subject: z.string().describe("Type of rule, e.g. 'distance'."),
  reason: z.string(),
  reasonType: z.enum(["atomic", "full"]).optional().default("atomic"),
});

export const constraintSetSchema = z
  .object({
    name: z.string(),
    tags: z.array(z.string()).min(1),
    scope: z.literal("object"),
    transform: z.array(transformRule),
    placement: z.array(placementRule),
  })
  .strict();

export type Action = z.infer<typeof actionEnum>;
export type RotationAxes = z.infer<typeof rotationAxes>;
export type TransformRule = z.infer<typeof transformRule>;
export type PlacementRule = z.infer<typeof placementRule>;
export type ConstraintSet = z.infer<typeof constraintSetSchema>;
