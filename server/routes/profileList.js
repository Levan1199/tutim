const routerFactory = require("express").Router;
const auth = require("../authenticate");
const User = require("../models/user");
const { id, required, pick, profileFields } = require("./helpers");
module.exports = (Model, role) => {
  const router = routerFactory();
  router.get("/", async (req, res) => {
    const hidden = await User.find({ isDisable: true }).distinct(
      role + "Profile",
    );
    res.json(await Model.find({ _id: { $nin: hidden.filter(Boolean) } }));
  });
  router.get("/:profileId", async (req, res) =>
    res.json(required(await Model.findById(id(req.params.profileId)))),
  );
  router.post("/", auth.verifyUser, auth.verifyAdmin, async (req, res) =>
    res.json(await Model.create(pick(req.body, profileFields))),
  );
  router.put(
    "/:profileId",
    auth.verifyUser,
    auth.verifyAdmin,
    async (req, res) =>
      res.json(
        required(
          await Model.findByIdAndUpdate(
            id(req.params.profileId),
            { $set: pick(req.body, profileFields) },
            { returnDocument: "after", runValidators: true },
          ),
        ),
      ),
  );
  router.delete("/", auth.verifyUser, auth.verifyAdmin, async (req, res) =>
    res.json(await Model.deleteMany()),
  );
  return router;
};
