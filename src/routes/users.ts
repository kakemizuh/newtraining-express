import * as express from "express";
import { UserController } from "../controllers";
export const router = express.Router();

const userController = new UserController();

//    /users

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUser);
router.post("/", userController.createUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.post("/:id/addItem", userController.addItem);
router.post("/:id/useItem", userController.useItem);
router.post("/:id/useGacha", userController.useGacha);
router.get("/:id/getUserItems", userController.getUserItems);
router.get("/:id/getItem", userController.getItem);
