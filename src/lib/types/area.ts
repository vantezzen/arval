import z from "zod/v4";

export const circleAreaSchema = z.object({
  type: z.literal("circle"),
  center: z.array(z.number()),
  radius: z.number(),
});
export type CircleArea = z.infer<typeof circleAreaSchema>;
export const bboxAreaSchema = z.object({
  type: z.literal("bbox"),
  coordinates: z.array(z.number()),
});
export type BboxArea = z.infer<typeof bboxAreaSchema>;
export const polygonAreaSchema = z.object({
  type: z.literal("polygon"),
  coordinates: z.array(z.array(z.number())),
});
export type PolygonArea = z.infer<typeof polygonAreaSchema>;

export const areaSchema = z.discriminatedUnion("type", [
  circleAreaSchema,
  bboxAreaSchema,
  polygonAreaSchema,
]);
export type Area = z.infer<typeof areaSchema>;
