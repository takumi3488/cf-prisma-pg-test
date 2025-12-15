import { zValidator } from "@hono/zod-validator";
import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Hono } from "hono";
import * as z from "zod";

const getPrismaClient = () => {
	const adapter = new PrismaPg({
		connectionString: process.env.DATABASE_URL || "",
	});

	const prisma = new PrismaClient({
		adapter,
	});
	return prisma;
};

const app = new Hono();

app.get("/", async (c) => {
	const prisma = getPrismaClient();
	return c.json(await prisma.user.findMany());
});

app.post(
	"/",
	zValidator(
		"json",
		z.object({
			name: z.string(),
			age: z.number(),
		}),
	),
	async (c) => {
		const prisma = getPrismaClient();
		const { name, age } = c.req.valid("json");
		const user = await prisma.user.create({
			data: {
				name,
				age,
			},
		});
		return c.json(user);
	},
);

export default app;
