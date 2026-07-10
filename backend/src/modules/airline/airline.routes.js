import { Router } from "express";


import authMiddleware from "../../middleware/auth.middleware.js";

import authorizeRoles from "../../middleware/role.middleware.js";


import {

create,
findAll,
findOne,
update,
remove

} from "./airline.controller.js";


import {
airlineValidator
} from "./airline.validator.js";


const router=Router();



router.post(
"/",
authMiddleware,
authorizeRoles("ADMIN"),
airlineValidator,
create
);



router.get(
"/",
findAll
);



router.get(
"/:id",
findOne
);



router.put(
"/:id",
authMiddleware,
authorizeRoles("ADMIN"),
update
);



router.delete(
"/:id",
authMiddleware,
authorizeRoles("ADMIN"),
remove
);



export default router;