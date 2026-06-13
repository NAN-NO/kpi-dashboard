import { z } from "zod";
const schema = z.number().nullable();
console.log("null:", schema.safeParse(null).success);
console.log("NaN:", schema.safeParse(NaN).success);
console.log("0:", schema.safeParse(0).success);
