'use strict';
// Load system modules

// Load modules
let _ = require( 'lodash' );
let Promise = require( 'bluebird' );
let debug = require( 'debug' )( 'DB' );
let MongoClient = require( 'mongodb' ).MongoClient;

// Load my modules

// Constant declaration
const COLLECTION_INDEXES = require( './config/indexes.json' );
const CONFIG = require( './config/mongo.json' );
const DB_URL = CONFIG.url;
const DB_NAME = CONFIG.name;
const COLLECTIONS = CONFIG.collections;

// Module variables declaration
let db;

// Module functions declaration
function getCollection( name ) {
  if( db ) {
    return db.collection( name );
  } else {
    throw new Error( 'DB not available' );
  }
}
function init() {
  debug( 'Init collections' );

  let promises = _.map( COLLECTIONS, ( collectionName, key )=> {
    let indexes = COLLECTION_INDEXES[ key ];
    debug( 'Ensure indexes for %s(%s) ', key, collectionName, indexes );

    let collection = getCollection( collectionName );
    return collection.createIndexes( indexes );
  } );

  return Promise.all( promises );
}
function connect() {
  if( db ) {
    throw new Error( 'DB already connected' );
  }


  debug( 'Opening conneciton' );
  let dbUrl = DB_URL+'/'+DB_NAME;
  let connectionOptions = {
    promiseLibrary: Promise,
  };



  return MongoClient
  .connect( dbUrl, connectionOptions )
  .tap( myDB => db = myDB )
  .tap( () => debug( 'Connection opened' ) )
  .tap( init );
}
function disconnect() {
  if( db ) {
    debug( 'Closing conneciton' );
    return db
    .close()
    .tap( () => debug( 'Connection closed' ) );
  } else {
    throw new Error( 'DB not available' );
  }
}








// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports.connect = connect;
module.exports.open = connect;
module.exports.disconnect = disconnect;
module.exports.close = disconnect;
module.exports.getCollection = getCollection;
module.exports.get = getCollection;


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78