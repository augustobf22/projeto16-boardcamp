import Joi from "joi"

export const schemaGames = Joi.object({
	name: Joi.string().required().min(1),
	image: Joi.string().required(),
	stockTotal: Joi.number().required().greater(0),
    pricePerDay: Joi.number().required().greater(0)
})