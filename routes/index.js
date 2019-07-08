/*  Chris Clifford
 *  3.2019
 *
 *  index router for api
 */

const express = require( 'express' );
const router = express.Router();
const jwt = require( 'express-jwt' );
const ctrlClass = require( '../controllers/class' );

router.get( '/class', ctrlClass.getClass );
router.get( '/class/subjlist', ctrlClass.getSubjList );

module.exports = router;
