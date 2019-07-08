const mongoose = require( 'mongoose' );
const crypto = require( 'crypto' );
const jwt = require( 'jsonwebtoken' );

let userSchema = new mongoose.Schema( {
  email: {
    type: String,
    unique: true,
    required: true
  }, 
  name: {
    type: String,
    required: true
  },
  hash: String,
  salt: String
} );

/* generate hash from password string */
userSchema.methods.setPassword = function( password ) {
  this.salt = crypto.randomBytes( 16 ).toString( 'hex' );
  this.hash = crypto.pbkdf2Sync( password, this.salt, 1000, 64, 'sha1' ).toString( 'hex' );
};

/* validate password string with salt */
userSchema.methods.validPassword = function( password ) {
  const hash = crypto.pbkdf2Sync( password, this.salt, 1000, 64, 'sha1' ).toString( 'hex' );
  return this.hash === hash;
};

userSchema.methods.generateJwt = function( ) {
  let expiry = new Date();
  /* set expiry as 7 days from now */
  expiry.setDate( expiry.getDate() + 7 );

  return jwt.sign( {
    /* payload */
    _id: this._id,
    email: this.email,
    name: this.name,
    exp: parseInt( expiry.getTime( ) / 1000 )
  }, process.env.JWT_SECRET );
};

mongoose.model( 'User', userSchema, 'users' );
