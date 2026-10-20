# Living Wall API Project Handoff

## Project Goal

Build the course capstone as a JavaScript REST API for managing living-wall installations at buildings. The project should use Express, Docker, Terraform, and DynamoDB, following the structure and incremental steps in `week6_lesson1/Project-Building.md`.

The initial concept was a living-wall maintenance service, but the scope was refined: this is primarily **building/account management for installed living walls**, not a maintenance-job scheduling system. The API should track each wall, its building, physical dimensions, and lifecycle status. Maintenance jobs could be added later, but are not part of the initial scope.

## Planned Data Model

Start with one DynamoDB table, `LivingWalls`, using `id` as the string partition key. Store one item per living wall. Candidate fields:

- `id`: generated UUID
- `buildingName`
- `buildingAddress`
- `buildingContact` (optional)
- `buildingId` (optional; useful if a building may have multiple walls)
- `wallLocation` (for example, reception or west atrium)
- `widthMetres`
- `heightMetres`
- `installedDate`
- `status` (for example, `active`, `maintenance`, `decommissioned`)

Keep the first version simple and consistent with the tutorial's single-table CRUD example. Joi should validate request data; the API should generate the ID rather than asking the client to provide it.

## Planned API

- `GET /living-walls`: list wall records
- `POST /living-walls`: register a new wall/installation
- `GET /living-walls/:id`: retrieve one wall
- `PUT /living-walls/:id`: replace/update the complete wall record
- `PATCH /living-walls/:id`: optional enhancement for partial changes, such as status or dimensions only
- `DELETE /living-walls/:id`: reserve for removing erroneous records; for a physical removal, prefer changing `status` to `decommissioned` to preserve the account record

The course explicitly teaches GET, POST, PUT, and DELETE. PATCH is a reasonable addition for partial updates, but may be left as an enhancement if keeping strictly to taught material.

## Controller and Router Layout

Use separate files:

```text
living-wall-project/
  index.js
  controllers/
    livingWallsController.js
  views/
    router.js
  models/
    livingWall.js
  services/
    database.js
  living_walls_database.tf
```

The current placeholder controller idea is:

```js
function getAllLivingWalls(req, res) {
  res.send("This endpoint will get all living walls and their building details from the database");
}

function createLivingWall(req, res) {
  res.send("This endpoint will register a new living wall installation for a building");
}

export default {
  getAllLivingWalls,
  createLivingWall,
};
```

The router should import the controller and connect handlers:

```js
import express from "express";
import livingWallsController from "../controllers/livingWallsController.js";

const Router = express.Router();

Router.route("/living-walls")
  .get(livingWallsController.getAllLivingWalls)
  .post(livingWallsController.createLivingWall);

export default Router;
```

`index.js` must import and mount the router:

```js
import Router from "./views/router.js";
app.use(express.json());
app.use(Router);
```

Each snippet belongs in its own file. Linux paths are case-sensitive, so filenames and imports must match exactly. These placeholder handlers only return text; database behavior comes later.

## Local Setup Status and Lessons

The user decided to build on their local Windows device instead of relying on the Amazon course workspace. They ran these `winget` installs in PowerShell, and the most recent command shown (Postman install) exited with code 0:

```powershell
winget install --id OpenJS.NodeJS.LTS --exact
winget install --id Docker.DockerDesktop --exact
winget install --id Hashicorp.Terraform --exact
winget install --id Amazon.AWSCLI --exact
winget install --id Postman.Postman --exact
```

This indicates the installs were attempted successfully, but the version checks have not yet been confirmed. Next, open a fresh PowerShell terminal and run:

```powershell
node --version
npm --version
docker --version
terraform --version
aws --version
```

Postman is installed for the tutorial's endpoint-testing step. `curl` is also available as a command-line alternative. Docker Desktop may need WSL 2 or a Windows restart. The AWS sandbox credentials may be temporary or restricted to the course workspace; verify they can be used from the local device before Terraform/AWS steps. Never commit AWS credentials or `.env` files.

## Port Conflict History

In the previous Linux/Amazon-workspace environment, port 3000 was published by Docker (`docker-proxy` owned the listeners). An old container was likely serving an older app. Moving the living-wall app to port 3001 resolved the conflict there. This was specific to that environment; the local Windows machine may have different port availability.

The app reads its port from `.env` via `process.env.PORT`. Ensure the port value and the URL used in Postman/curl match. For example, with `PORT=3001`, test `http://localhost:3001/living-walls`.

A response `Cannot GET /living-walls` is an Express 404: a server answered, but that server did not have the route mounted (or the request reached an old server/wrong port). Confirm `index.js` imports `./views/router.js`, calls `app.use(Router)`, and that the request uses the port on which this project started.

## Collaboration Notes

The user is learning and benefits from concise, step-by-step explanations with concrete code, filenames, commands, and examples. They are working in VS Code on Windows locally and may still encounter Bash snippets from the course; translate shell commands for PowerShell when needed. Explain the difference between route configuration and controller functions when relevant. Do not assume the course workspace and the local Windows environment share processes, Docker containers, ports, or installed packages.
