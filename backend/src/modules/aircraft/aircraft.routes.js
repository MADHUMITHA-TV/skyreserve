import { Router } from "express";


import authMiddleware from "../../middleware/auth.middleware.js";

import authorizeRoles from "../../middleware/role.middleware.js";


import {

create,
findAll,
findOne,
update,
remove

} from "./aircraft.controller.js";


import {
aircraftValidator
} from "./aircraft.validator.js";


const router = Router();



router.post(
"/",
authMiddleware,
authorizeRoles("ADMIN"),
aircraftValidator,
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