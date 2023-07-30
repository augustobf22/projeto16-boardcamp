import Joi from "joi"

export const schemaRentals = Joi.object({
    customerId: Joi.number().required().greater(0), 
    gameId: Joi.number().required().greater(0), 
    daysRented: Joi.number().required().greater(0)
})