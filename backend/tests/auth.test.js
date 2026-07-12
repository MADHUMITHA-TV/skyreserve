import request from "supertest";
import bcrypt from "bcrypt";

import app from "../src/app.js";
import prisma from "../src/config/database.js";

import { testUser } from "./helpers/testData.js";

describe("Auth API", () => {

  describe("POST /api/v1/auth/register", () => {

    it("should register a new user", async () => {

      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(testUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(testUser.email);

    });

  });

  describe("POST /api/v1/auth/login", () => {

    beforeEach(async () => {

      const hashedPassword = await bcrypt.hash(
        testUser.password,
        10
      );

      await prisma.user.create({
        data: {
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          email: testUser.email,
          password: hashedPassword,
          phone: testUser.phone,
          role: testUser.role
        }
      });

    });

    it("should login successfully", async () => {

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("accessToken");
      

    });

    it("should fail with wrong password", async () => {

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: testUser.email,
          password: "WrongPassword"
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);

    });

  });

});