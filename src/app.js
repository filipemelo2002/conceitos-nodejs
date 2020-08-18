const express = require("express");
const cors = require("cors");

const { v4: uuid } = require("uuid");
const { isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function checkIfRepositoryExists(request, response, next) {
  const { id } = request.params;
  const repositoryIndex = repositories.findIndex(
    (repository) => repository.id === id
  );
  if (repositoryIndex < 0)
    return response
      .status(400)
      .json({ message: "could not find such repository" });
  request.index = repositoryIndex;
  return next();
}
function validateProjectId(request, response, next) {
  const { id } = request.params;
  if (!isUuid(id))
    return response.status(400).json({ message: "Invalid Project ID" });

  return next();
}

app.use("/repositories/:id", validateProjectId, checkIfRepositoryExists);
app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;
  const repository = {
    title,
    url,
    techs,
    id: uuid(),
    likes: 0,
  };
  repositories.push(repository);
  return response.json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;
  const newRepository = {
    id,
    title,
    url,
    techs,
    likes: repositories[request.index].likes,
  };
  repositories[request.index] = newRepository;
  return response.json(newRepository);
});

app.delete("/repositories/:id", (request, response) => {
  repositories.splice(request.index, 1);
  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;
  const { title, techs, likes, url } = repositories[request.index];
  const likedRepository = {
    id,
    title,
    techs,
    url,
    likes: likes + 1,
  };
  repositories[request.index] = likedRepository;
  return response.json(likedRepository);
});

module.exports = app;
