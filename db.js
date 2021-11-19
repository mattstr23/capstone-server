const pg = require("pg");
const creds = new pg.Client(
	"postgres://soejbsoj:g5Fj9W9_eiyCwZUo22G18RKW57XGXw0F@fanny.db.elephantsql.com/soejbsoj"
);

module.exports = creds;
