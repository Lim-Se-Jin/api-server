const config = require("../config")[process.env.NODE_ENV];
const mysql = require("mysql2");

function createDatabase() {
  let instance = null;
  return {
    getInstance: function () {
      if (instance == null) {
        const pool = mysql.createPool(config.DB);
        instance = pool.promise();
      }
      return instance;
    }
  };
}

module.exports = createDatabase().getInstance();