import request from 'supertest'
import makeApp from './app.js'
import { jest } from '@jest/globals'

const createUser = jest.fn()
const getUser = jest.fn()

const app = makeApp({
  createUser,
  getUser
})

describe("POST /users", () => {

  beforeEach(() => {
    createUser.mockReset()
    createUser.mockResolvedValue(0)
  })

  /* Happy Path */
  describe("given a username and password", () => {
    test("should save the username and password to the database", async () => {
      const bodyData = [
        { username: "Danilo", password: "imissyouuwu" },
        { username: "Gipsy", password: "softwareQA" },
        { username: "Nick", password: "GiveMeJobPlease" },
      ]
      for (const body of bodyData) {
        createUser.mockReset()
        await request(app).post("/users").send(body)
        expect(createUser.mock.calls.length).toBe(1)
        expect(createUser.mock.calls[0][0]).toBe(body.username)
        expect(createUser.mock.calls[0][1]).toBe(body.password)
      }
    })

    test("should respond with a json object containg the user id", async () => {
      for (let i = 0; i < 10; i++) {
        createUser.mockReset()
        createUser.mockResolvedValue(i)
        const response = await request(app).post("/users").send({ username: "Danilo", password: "imissyouuwu" })
        expect(response.body.userId).toBe(i)
      }
    })

    test("should respond with a 200 status code", async () => {
      const response = await request(app).post("/users").send({
        username: "Danilo", 
        password: "imissyouuwu"
      })
      expect(response.statusCode).toBe(200)
    })
    test("should specify json in the content type header", async () => {
      const response = await request(app).post("/users").send({
        username: "Danilo", 
        password: "imissyouuwu"
      })
      expect(response.headers['content-type']).toEqual(expect.stringContaining("json"))
    })
    test("response has userId", async () => {
      const response = await request(app).post("/users").send({
        username: "Danilo", 
        password: "imissyouuwu"
      })
      expect(response.body.userId).toBeDefined()
    })
  })

  /* Bad Path */
  describe("when the username and password is missing", () => {
    test("should respond with a status code of 400", async () => {
      const bodyData = [
        {username: "username"},
        {password: "password"},
        {}
      ]
      for (const body of bodyData) {
        const response = await request(app).post("/users").send(body)
        expect(response.statusCode).toBe(400)
      }
    })
  })
})

describe("GET /users/:username", () => {
  beforeEach(() => {
    getUser.mockReset();
  });

  /* Happy Path */
  test("should retrieve user data by username", async () => {
    const mockUser = { id: 1, username: "TestUser" };
    getUser.mockResolvedValue(mockUser);

    // Make a GET request to retrieve user data
    const response = await request(app).get("/users/TestUser");

    // Expectations
    expect(getUser.mock.calls.length).toBe(1);
    expect(getUser.mock.calls[0][0]).toBe("TestUser");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(mockUser);
  });

  /* Bad Path */
  test("should respond with 404 if user is not found", async () => {
    getUser.mockResolvedValue(null);

    // Make a GET request for a non-existent user
    const response = await request(app).get("/users/NonExistentUser");

    // Expectations
    expect(getUser.mock.calls.length).toBe(1);
    expect(response.statusCode).toBe(404);
  });
});