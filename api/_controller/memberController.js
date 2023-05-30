const db = require("../../plugins/mysql");
const TABLE = require("../../util/TABLE");
const STATUS = require("../../util/STATUS");
const { resData, isEmpty, getIp } = require("../../util/lib");
const moment = require("../../util/moment");

//https://blog.logrocket.com/node-js-crypto-module-a-tutorial/
const crypto = require("crypto");
const { SECRET_KEY, PORT } = require("../../config")[process.env.NODE_ENV];

const memberController = {



  //신규멤버
  createMember: async (req) => {
    try {
      let { mb_id, mb_password } = req.body;
      //파라미터 체크
      if (isEmpty(mb_id) || isEmpty(mb_password)) {
        return await resData(
          STATUS.E100.result, //status
          STATUS.E100.resultDesc, //message
          moment().format("LT")
        );
      }
      const at = moment().format("LT");
      const ip = getIp(req);
      const payload = {
        ...req.body, //req.body 모두 가져오고 뒤이어
        mb_create_at: at,
        mb_update_at: at,
        mb_create_ip: ip,
        mb_update_ip: ip,
      };

      // image파람은 무조건 지움 --> 경로는 글로벌로 읽을 것임
      delete payload.mb_image;

      if (req.file) {
        const protocol = req.protocol;
        const hostname = req.hostname;
        payload.mb_photo = `${protocol}://${hostname}:${PORT}/${req.file.path}`;
        console.log("upload file", protocol, hostname, PORT);
      }
      const password = payload.mb_password;

      // 비밀번호 암호화
      payload.mb_password = crypto
        .pbkdf2Sync(password, SECRET_KEY, 10, 64, "sha512")
        .toString("base64");

      // const sql = sqlHelper.Insert(TABLE.USER, payload);
      let sql = `INSERT INTO ${TABLE.USER} ( {1} ) VALUES ( {2} )`;
      const keys = Object.keys(payload);
      const values = [];
      const prepare = new Array(keys.length).fill("?").join(",");
      for (const key of keys) {
        values.push(payload[key]); //키값만
      }
      sql = sql.replace("{1}", keys.join(", "));
      sql = sql.replace("{2}", prepare);

      const [row] = await db.execute(sql, values);
      const data = row.affectedRows == 1;
      console.log(row);
      if (data) {
        return resData(
          STATUS.S200.result,
          STATUS.S200.resultDesc,
          moment().format("LT"),
          { mb_id: payload.mb_id }
        );
      } else {
        return resData(
          STATUS.E400.result,
          STATUS.E400.resultDesc,
          moment().format("LT")
        );
      }
    } catch (error) {
      return await resData(
        STATUS.E300.result, //status
        STATUS.E300.resultDesc, //message
        moment().format("LT")
      );
    }
  },

  // duplecheck
  duplicateCheck: async (req) => {
    try {
      console.log(req.params.value);
      const field = req.params.field;
      const value = req.params.value;
      console.log(field, value);

      if (isEmpty(field) || isEmpty(value)) {
        //파라미터체크
        return await resData(
          STATUS.E100.result,
          STATUS.E100.resultDesc,
          moment().format("LT")
        );
      }
      const payload = {
        [field]: value,
      };

      const keys = Object.keys(payload);
      let where = [];
      let values = [];
      let query = `select count(*) AS cnt from ${TABLE.USER}`;
      for (const key of keys) {
        where.push(`${key}=?`);
        values.push(payload[key]);
      }
      if (where.length > 0) {
        query += ` WHERE ` + where.join(" AND ");
      }

      const [[count]] = await db.execute(query, values);

      return resData(
        STATUS.S200.result,
        STATUS.S200.resultDesc,
        moment().format("LT"),
        count
      );
    } catch (e) {
      console.error(e);
      return {
        err: resData(
          STATUS.E300.result,
          STATUS.E300.resultDesc,
          moment().format("LT")
        ),
      };
    }
  },

  loginLocal: async (req) => {
    try {
      const { mb_id, mb_password } = req.body;
      console.log(mb_id, mb_password);
      if (isEmpty(mb_id) || isEmpty(mb_password)) {
        //파라미터체크
        return await resData(
          STATUS.E100.result,
          STATUS.E100.resultDesc,
          moment().format("LT")
        );
      }
      const payload = {
        ...req.body,
      };
      // 암호화
      const password = payload.mb_password;
      payload.mb_password = crypto
        .pbkdf2Sync(password, SECRET_KEY, 10, 64, "sha512")
        .toString("base64");

      // 디비 멤버 확인
      let query = `select mb_id, mb_photo from ${TABLE.USER}`;
      const values = [];
      const where = []; // 하위 업데이트 시 쓸것
      const keys = Object.keys(payload);
      for (const key of keys) {
        where.push(`${key}=?`);
        values.push(payload[key]);
      }

      if (where.length > 0) {
        query += " WHERE " + where.join(" AND ");
      }
      // 데이터 읽기
      const [[data]] = await db.execute(query, values); //select

      // update login time
      if (data) {
        const at = moment().format("LT");
        const ip = getIp(req);
        const updatePayload = {
          mb_login_at: at,
          mb_login_ip: ip,
        };

        let updateQuery = `UPDATE ${TABLE.USER} SET {1} `;
        const upWhere = [];
        const upSets = [];
        const keys = Object.keys(updatePayload);
        for (const key of keys) {
          upSets.push(`${key}=?`);
          upWhere.push(updatePayload[key]);
        }
        upWhere.push(data.mb_id);
        updateQuery = updateQuery.replace("{1}", upSets.join(", "));
        updateQuery += `WHERE mb_id=?`;
        const [updateResult] = await db.execute(updateQuery, upWhere);
        if (updateResult.affectedRows == 1) {
          return resData(
            STATUS.S200.result,
            STATUS.S200.resultDesc,
            moment().format("LT"),
            data
          );
        } else {
          return {
            err: resData(
              STATUS.E400.result,
              STATUS.E400.resultDesc,
              moment().format("LT")
            ),
          };
        }
      } else {
        return resData(
          STATUS.S201.result,
          STATUS.S201.resultDesc,
          moment().format("LT")
        );
      }
    } catch (e) {
      console.error(e);
      return {
        err: resData(
          STATUS.E300.result,
          STATUS.E300.resultDesc,
          moment().format("LT")
        ),
      };
    }
  }
};

module.exports = memberController;