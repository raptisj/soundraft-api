import { Request, Response } from "express";
import { errors } from "../constants/index.ts";
import * as roleService from "../services/roles.ts";

const update = async (req: Request, res: Response) => {
  if (!res.locals.user) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  const userId = res.locals.user.id;
  const projectId = req.body?.project_id;
  const roleId = req.params.id;
  const role = req.body?.role;

  const isAdmin = await roleService.isProjectAdmin(projectId, userId);

  if (!isAdmin) {
    return res.status(404).json({ errors: errors.USER_NOT_ADMIN });
  }

  try {
    const { data } = await roleService.update(roleId, role);

    console.log(data, "data");
    return res.status(200).json(data);
  } catch (e) {
    console.log(e, "e");
    return res.status(404).end();
  }
};

export { update };
