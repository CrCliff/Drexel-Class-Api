const mongoose = require( 'mongoose' );
const readLine = require( 'readline' );

const config = require('../config/config.json');
const secret = require('../config/config.secret.json');

const config_common = require(secret["config_common"]);
const secret_common = require(secret["secret_common"]);

require(secret_common['project_root'] + config_common['models']['class']['path']);

let URI;
const PROD_DB = 'mongodb://localhost:27017/prod';
const LIVE_DB = 'mongodb://localhost:27017/drexel-schedule';

if ( process.env.NODE_ENV === 'prod' ) {
  URI = PROD_DB;
}
else {
  URI = LIVE_DB;
}

mongoose.connect( URI );

/* Shutdown function for specific mongoose disconnects */
const cleanShutdown = function (msg, callback) {
  mongoose.connection.close( () => {
    console.log( 'Mongoose disconnected through ' + msg + '.' );
    callback();
  });
};

/* Emit SIGINT on Windows machines. */
if ( process.platform === 'win32' ) {
  var rl = readLine.createInterface ({
    input: process.stdin,
    output: process.stdout
  });
  rl.on( 'SIGINT' , () => {
    process.emit( 'SIGINT' );
  });
}

/* Mongoose successfully connected. */
mongoose.connection.on( 'connected' , () => {
  console.log( 'Mongoose connected to ' + URI );
});

/* Mongoose connection error. */
mongoose.connection.on( 'error', (connectErr) => {
  console.log( 'Mongoose connection error: ' + connectErr );
});

/* Mongoose connection ended. */
mongoose.connection.on( 'disconnected', () => {
  console.log( 'Mongoose disconnected.' );
});

/* SIGUSR2 msg = nodemon shutdown */
process.once( 'SIGUSR2', () => {
  cleanShutdown( 'nodemon restart', () => {
  	process.kill( process.pid, 'SIGUSR2' );
  });	
});

/* SIGINT msg = application shutdown */
process.once( 'SIGINT', () => {
  cleanShutdown( 'app termination', () => {
    process.exit(0);
  });
});

