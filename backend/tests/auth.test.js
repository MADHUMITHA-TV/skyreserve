import request from "supertest";

import app from "../src/app.js";
import prisma from "../src/config/database.js";

describe("Auth API", () => {

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  it("should register a new user", async () => {

    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        firstName: "John",
        lastName: "Doe",
        email: "john@test.com",
        password: "password123"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe("john@test.com");

  });

  it("should not register duplicate email", async () => {

  await request(app)
    .post("/api/v1/auth/register")
    .send({
      firstName: "John",
      lastName: "Doe",
      email: "john@test.com",
      password: "password123"
    });

  const res = await request(app)
    .post("/api/v1/auth/register")
    .send({
      firstName: "John",
      lastName: "Doe",
      email: "john@test.com",
      password: "password123"
    });

  expect(res.statusCode).toBe(400);
  expect(res.body.success).toBe(false);

});

  it("should reject invalid registration data", async () => {

    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        firstName: "",
        lastName: "",
        email: "invalid-email",
        password: "123"
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);

  });

  it("should login successfully", async () => {

    await request(app)
      .post("/api/v1/auth/register")
      .send({
        firstName: "John",
        lastName: "Doe",
        email: "john@test.com",
        password: "password123"
      });

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "john@test.com",
        password: "password123"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe("john@test.com");

  });

  it("should reject invalid password", async () => {

    await request(app)
      .post("/api/v1/auth/register")
      .send({
        firstName: "John",
        lastName: "Doe",
        email: "john@test.com",
        password: "password123"
      });

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "john@test.com",
        password: "wrongpassword"
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);

  });

  it("should reject unknown email", async () => {

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "unknown@test.com",
        password: "password123"
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);

  });

});