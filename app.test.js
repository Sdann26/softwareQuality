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

  /* Verificacion de funcionamiento */
  describe("dado un nombre de usuario y contraseña", () => {
    test("debería guardar el nombre de usuario y la contraseña en la base de datos", async () => {
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

    test("debería responder con un objeto JSON que contiene el ID de usuario", async () => {
      for (let i = 0; i < 10; i++) {
        createUser.mockReset()
        createUser.mockResolvedValue(i)
        const response = await request(app).post("/users").send({ username: "Danilo", password: "imissyouuwu" })
        expect(response.body.userId).toBe(i)
      }
    })

    test("debería responder con un código de estado 200", async () => {
      const response = await request(app).post("/users").send({
        username: "Danilo", 
        password: "imissyouuwu"
      })
      expect(response.statusCode).toBe(200)
    })
    test("debería especificar 'json' en la cabecera del tipo de contenido", async () => {
      const response = await request(app).post("/users").send({
        username: "Danilo", 
        password: "imissyouuwu"
      })
      expect(response.headers['content-type']).toEqual(expect.stringContaining("json"))
    })
    test("la respuesta tiene el ID de usuario", async () => {
      const response = await request(app).post("/users").send({
        username: "Danilo", 
        password: "imissyouuwu"
      })
      expect(response.body.userId).toBeDefined()
    })
  })

  /* Verificacion de errores */
  describe("cuando falta el nombre de usuario y la contraseña", () => {
    test("debería responder con un código de estado 400", async () => {
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

  /* Verificacion de funcionamiento */
  test("debería recuperar los datos del usuario por nombre de usuario", async () => {
    const mockUser = { id: 1, username: "UsuarioPrueba" };
    getUser.mockResolvedValue(mockUser);

    // Hacer una solicitud GET para recuperar los datos del usuario
    const response = await request(app).get("/users/UsuarioPrueba");

    // Expectativas
    expect(getUser.mock.calls.length).toBe(1);
    expect(getUser.mock.calls[0][0]).toBe("UsuarioPrueba");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(mockUser);
  });

  /* Verificacion de errores */
  test("debería responder con un código 404 si el usuario no se encuentra", async () => {
    getUser.mockResolvedValue(null);

    // Hacer una solicitud GET para un usuario que no existe
    const response = await request(app).get("/users/UsuarioNoExistente");

    // Expectativas
    expect(getUser.mock.calls.length).toBe(1);
    expect(response.statusCode).toBe(404);
  });
});
