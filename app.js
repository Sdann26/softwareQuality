import express from 'express'

export default function (database) {
  const app = express()

  app.use(express.json())

  // Ruta para crear un nuevo usuario
  app.post('/users', async (req, res) => {
    const { password, username } = req.body
    if (!password || !username) {
      res.sendStatus(400)
      return
    }

    const userId = await database.createUser(username, password)

    res.send({ userId })
  })

  // Ruta para obtener información de un usuario por su username
  app.get('/users/:username', async (req, res) => {
    const { username } = req.params;

    if (!username) {
      res.sendStatus(400);
      return;
    }

    try {
      const user = await database.getUser(username);

      if (!user) {
        res.sendStatus(404);
        return;
      }

      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.sendStatus(500);
    }
  });

  return app
}
