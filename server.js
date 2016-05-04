'use strict';
// Load system modules

// Load modules
// const Promise = require( 'bluebird' );
const Redis = require( 'ioredis' );
const debug = require( 'debug' )( 'UrbanScope:server' );

// Load my modules
const db = require( 'db-utils' );
const api = require( './api/' );

// Constant declaration
const CONFIG = require( './config/index.json' );
const REDIS_CONFIG = require( './config/redis.json' );
const MONGO = require( './config/mongo.json' );
const COLLECTIONS = MONGO.collections;
const DB_URL = MONGO.url;
const DB_NAME = MONGO.name;

// Module variables declaration

// Module functions declaration

// Module class declaration

// Module initialization (at first load)
db.mapping = COLLECTIONS

// Entry point
db.open( DB_URL, DB_NAME )
.then( ()=> {
  debug( 'DB ready, starting webserver' );

  api.context.redis = new Redis( REDIS_CONFIG );
  api.context.db = db;

  api.listen( CONFIG.port );

  debug( 'Server ready on port %d', CONFIG.port );
} )


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78