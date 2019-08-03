/*  Chris Clifford
 *  3.2019
 *
 *  index router for api
 */

const express = require( 'express' );
const router = express.Router();
const jwt = require( 'express-jwt' );

const config = require('../config/config.json');
const secret = require('../config/config.secret.json');

// get controllers/class.js
const ctrlClass = require(secret["project_root"] + config["controllers"]["class"]["path"]);

router.get( '/class', ctrlClass.getClass );
router.get( '/class/subjlist', ctrlClass.getSubjList );

module.exports = router;
