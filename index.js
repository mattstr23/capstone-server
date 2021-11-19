require("dotenv").config();
const express = require("express");
const app = express();
const creds = require("./db.js");
const PORT = 3001;
const bcrypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");
const jwtSecret = process.env.KEY;

// middleware
// pain
app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {});
app.post("/registerUser", async (req, res) => {
	const hash = await bcrypt.hash(req.body.password, 10);
	const email = req.body.email;
	const password = req.body.password;
	const firstName = req.body.firstName;
	const lastName = req.body.lastName;
	creds.connect((err, client, release) => {
		if (email && password && lastName && firstName) {
			creds.query(
				`INSERT INTO "Users" ("firstName", "lastName", "email", "password") VALUES ('${req.body.firstName}', '${req.body.lastName}', '${req.body.email}', '${hash}');`,
				(err, result) => {
					if (err) {
						res.status(400).send(err);
					}
					res.status(200).send(result);
				}
			);
		}
	});
});

app.post("/loginUser", (req, res) => {
	const email = req.body.email;
	const password = req.body.password;
	const compare = async (results, res) => {
		const validate = await bcrypt.compare(password, results.rows[0].password);
		if (validate) {
			const accessToken = jwt.sign(
				{
					firstName: results.rows[0].firstName,
					lastName: results.rows[0].lastName,
					email: results.rows[0].email,
					id: results.rows[0].id,
				},
				jwtSecret,
				{ expiresIn: 10800 }
			);
			var ca = accessToken;
			var decoded = jwt_decode(ca);
			res.status(200).json({ token: accessToken });
		} else {
			res.status(400).send("User not authenticated");
		}
	};
	creds.connect((err, client, release) => {
		if (email) {
			creds.query(`SELECT * FROM "Users" WHERE email = '${email}'`, (error, results) => {
				if (results) {
					compare(results, res);
				} else {
					res.status(400).send(error);
				}
			});
		} else {
			res.status(400).send("Please enter Email and Password!");
			res.end();
		}
	});
});

app.post("/account", (req, res) => {
	const authHeader = req.headers["authorization"];
	if (authHeader) {
		let token = authHeader.split(" ")[1];
		const decoded = jwt.verify(token, jwtSecret);
		if (decoded) {
			const id = decoded.id;
			creds.connect((err, client, release) => {
				creds.query(`SELECT * FROM "Users" WHERE "id" = ${id}`, (error, results) => {
					if (results) {
						res.send(results);
					} else {
						res.send(error);
					}
				});
			});
		}
	} else {
		res.end();
	}
});

app.delete("/deleteUser", (req, res) => {
	creds.connect((err, client, release) => {
		creds.query(`DELETE FROM "Users" WHERE email = ${req.body.email}`, (error, results) => {
			if (results) {
				res.send(results);
			} else {
				res.send(error);
			}
		});
	});
});

app.post("/updateUser", (req, res) => {
	const authHeader = req.headers["authorization"];
	if (authHeader) {
		let token = authHeader.split(" ")[1];
		const decoded = jwt.verify(token, jwtSecret);
		if (decoded) {
			const id = decoded.id;
			creds.connect((err, client, release) => {
				creds.query(
					`UPDATE "Users" SET "email" = '${req.body.email}', "firstName" = '${req.body.firstName}', "lastName" = '${req.body.lastName}', "password" = '${req.body.password}' WHERE "id" = '${id}'`,
					(error, results) => {
						if (results) {
							res.status(200).send("succesful");
						} else {
							res.send(error);
						}
					}
				);
			});
		}
	} else {
		res.end();
	}
});

app.post("/removeCrypto", (req, res) => {
	const authHeader = req.headers["authorization"];
	if (authHeader) {
		let token = authHeader.split(" ")[1];
		const decoded = jwt.verify(token, jwtSecret);
		if (decoded) {
			const id = decoded.id;
			creds.connect((err, client, release) => {
				creds.query(`DELETE FROM "Wallets" WHERE "id" = ${req.body.crypto}`, (error, results) => {
					if (results) {
						res.status(200).send(results);
					} else {
						res.send(error);
					}
				});
			});
		}
	}
});

app.post("/addCrypto", (req, res) => {
	const newBody = JSON.stringify(req.body);
	const authHeader = req.headers["authorization"];
	if (authHeader) {
		let token = authHeader.split(" ")[1];
		const decoded = jwt.verify(token, jwtSecret);
		if (decoded) {
			const id = decoded.id;
			creds.connect((err, client, release) => {
				creds.query(`INSERT INTO "Wallets" ("userId", "crypto")  VALUES ('${id}', '${newBody}')`, (error, results) => {
					if (results) {
						res.send(results);
					} else {
						res.send(error);
					}
				});
			});
		}
	} else {
		res.end();
	}
});
app.post("/authenticateToken", (req, res) => {
	const authHeader = req.headers["authorization"];

	if (authHeader) {
		let token = authHeader.split(" ")[1];
		const decoded = jwt.verify(token, jwtSecret);
		if (decoded) {
			res.status(200).send(true);
		}
	} else {
		res.status(400).send(false);
	}
});

app.post("/allCrypto", (req, res) => {
	const authHeader = req.headers["authorization"];
	if (authHeader) {
		let token = authHeader.split(" ")[1];
		const decoded = jwt.verify(token, jwtSecret);
		if (decoded) {
			const id = decoded.id;
			creds.connect((err, client, release) => {
				creds.query(`SELECT * FROM "Wallets" WHERE "userId" = ${id}`, (error, results) => {
					if (results) {
						res.send(results);
					} else {
						res.send(error);
					}
				});
			});
		}
	} else {
		res.end();
	}
});

app.listen(PORT);
