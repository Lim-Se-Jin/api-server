const router = require("express").Router();
const multer = require("multer");
const randToken = require("rand-token");
const memberController = require("./_controller/memberController");

const newName = randToken.generate(16);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `${MEMBER_PHOTO_PATH}`);
  },
  filename: function (req, file, cb) {
    cb(null, `${newName}.jpg`);
  },
});

const upload = multer({ storage: storage });

//신규가입
router.post("/", upload.single("mb_image"), async (req, res) => {
  const result = await memberController.createMember(req);
  console.log("result", result);
  res.json(result);
});

//중복체크
router.get("/duplicateCheck/:field/:value", async (req, res) => {
  console.log(req.params);
  const result = await memberController.duplicateCheck(req);
  res.json(result);
});

//로그인
router.post("/loginLocal", async (req, res) => {
  const result = await memberController.loginLocal(req);
  res.json(result);
});
module.exports = router;