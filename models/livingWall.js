import Joi from "joi";

const livingWallSchema = Joi.object({
  buildingName: Joi.string().trim().required(),
  buildingAddress: Joi.string().trim().required(),
  buildingContact: Joi.string().trim().optional(),
  buildingId: Joi.string().trim().optional(),
  wallLocation: Joi.string().trim().required(),
  widthMetres: Joi.number().positive().required(),
  heightMetres: Joi.number().positive().required(),
  installedDate: Joi.string().isoDate().required(),
  status: Joi.string()
    .valid("active", "maintenance", "decommissioned")
    .required(),
});

export const livingWallPatchSchema = Joi.object({
  widthMetres: Joi.number().positive(),
  heightMetres: Joi.number().positive(),
  status: Joi.string().valid("active", "maintenance", "decommissioned"),
})
  .min(1)
  .unknown(false);

export default livingWallSchema;
