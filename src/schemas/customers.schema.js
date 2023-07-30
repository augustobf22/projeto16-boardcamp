import Joi from "joi"

export const schemaCustomers = Joi.object({
	name: Joi.string().required().min(1),
	phone: Joi.string().min(10).max(11).required(),
	cpf: Joi.string().length(11).pattern(/^[0-9]+$/).required(),
    birthday: Joi.date().required()
})