import { api } from "../utils";

describe("(Students) Auth endpoints", () => {
  describe("POST /auth/login", () => {
    it("should return a status 200", async () => {
      await api
        .post("/api/students/login")
        .send({
          username: "student1",
          password: "pass123"
        })
        .expect(200)
        .expect("Content-Type", /application\/json/);
    });

    it("should return a token", async () => {
      const response = await api.post("/api/students/login").send({
        username: "student1",
        password: "pass123"
      });

      expect(response.body.token).toBeDefined();
    });

    it("should return a 401 error", async () => {
      const response = await api
        .post("/api/students/login")
        .send({
          username: "student1",
          password: "wrongpassword"
        })
        .expect(401)
        .expect("Content-Type", /application\/json/);

      expect(response.body.error).toBeDefined();
    });
  });
});
