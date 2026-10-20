import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import livingWallSchema, {
  livingWallPatchSchema,
} from "../models/livingWall.js";
import database from "../services/database.js";

const tableName = process.env.DYNAMODB_TABLE_NAME || "LivingWalls";

function validateLivingWall(body) {
  return livingWallSchema.validate(body, { abortEarly: false });
}

function sendValidationError(res, error) {
  return res.status(400).json({
    errors: error.details.map((detail) => detail.message),
  });
}

function isConditionalCheckFailed(error) {
  return error.name === "ConditionalCheckFailedException";
}

async function getAllLivingWalls(req, res, next) {
  try {
    const result = await database.send(
      new ScanCommand({ TableName: tableName })
    );
    res.status(200).json(result.Items ?? []);
  } catch (error) {
    next(error);
  }
}

async function createLivingWall(req, res, next) {
  const { error, value } = validateLivingWall(req.body);
  if (error) {
    return sendValidationError(res, error);
  }

  const livingWall = { id: uuidv4(), ...value };

  try {
    await database.send(
      new PutCommand({
        TableName: tableName,
        Item: livingWall,
        ConditionExpression: "attribute_not_exists(id)",
      })
    );
    res.status(201).json({
      message: "Successfully created living wall",
      data: livingWall,
    });
  } catch (error) {
    next(error);
  }
}

async function getLivingWallById(req, res, next) {
  try {
    const result = await database.send(
      new GetCommand({
        TableName: tableName,
        Key: { id: req.params.id },
      })
    );

    if (!result.Item) {
      return res.status(404).json({ message: "No living wall found" });
    }

    res.status(200).json(result.Item);
  } catch (error) {
    next(error);
  }
}

async function updateLivingWallById(req, res, next) {
  const { error, value } = validateLivingWall(req.body);
  if (error) {
    return sendValidationError(res, error);
  }

  const expressionNames = {};
  const expressionValues = {};
  const assignments = Object.entries(value).map(([key, fieldValue], index) => {
    const name = `#field${index}`;
    const field = `:value${index}`;
    expressionNames[name] = key;
    expressionValues[field] = fieldValue;
    return `${name} = ${field}`;
  });

  try {
    const result = await database.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { id: req.params.id },
        UpdateExpression: `SET ${assignments.join(", ")}`,
        ConditionExpression: "attribute_exists(id)",
        ExpressionAttributeNames: expressionNames,
        ExpressionAttributeValues: expressionValues,
        ReturnValues: "ALL_NEW",
      })
    );
    res.status(200).json(result.Attributes);
  } catch (error) {
    if (isConditionalCheckFailed(error)) {
      return res.status(404).json({ message: "No living wall found" });
    }
    next(error);
  }
}

async function patchLivingWallById(req, res, next) {
  const { error, value } = livingWallPatchSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return sendValidationError(res, error);
  }

  const expressionNames = {};
  const expressionValues = {};
  const assignments = Object.entries(value).map(([key, fieldValue], index) => {
    const name = `#field${index}`;
    const field = `:value${index}`;
    expressionNames[name] = key;
    expressionValues[field] = fieldValue;
    return `${name} = ${field}`;
  });

  try {
    const result = await database.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { id: req.params.id },
        UpdateExpression: `SET ${assignments.join(", ")}`,
        ConditionExpression: "attribute_exists(id)",
        ExpressionAttributeNames: expressionNames,
        ExpressionAttributeValues: expressionValues,
        ReturnValues: "ALL_NEW",
      })
    );
    res.status(200).json(result.Attributes);
  } catch (error) {
    if (isConditionalCheckFailed(error)) {
      return res.status(404).json({ message: "No living wall found" });
    }
    next(error);
  }
}

async function deleteLivingWallById(req, res, next) {
  try {
    await database.send(
      new DeleteCommand({
        TableName: tableName,
        Key: { id: req.params.id },
        ConditionExpression: "attribute_exists(id)",
      })
    );
    res.status(204).end();
  } catch (error) {
    if (isConditionalCheckFailed(error)) {
      return res.status(404).json({ message: "No living wall found" });
    }
    next(error);
  }
}

export default {
  getAllLivingWalls,
  createLivingWall,
  getLivingWallById,
  updateLivingWallById,
  patchLivingWallById,
  deleteLivingWallById,
};
