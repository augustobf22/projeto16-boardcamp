import { Router } from "express";
import { postCustomers, getCustomers, getCustomersById, updateCustomer } from "../controllers/customers.controller.js";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import { schemaCustomers } from "../schemas/customers.schema.js";

const customersRouter = Router();

customersRouter.post("/customers", validateSchema(schemaCustomers), postCustomers);
customersRouter.get("/customers", getCustomers);
customersRouter.get("/customers/:id", getCustomersById);
customersRouter.put("/customers/:id", validateSchema(schemaCustomers), updateCustomer);

export default customersRouter;
