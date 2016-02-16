'use strict';
/* eslint-disable no-unused-expressions */

process.env.NODE_ENV = 'test'; // Why not?

let db = require( 'db-utils' );

// Const
const MONGO = require( '../config/mongo.json' );
const INDEXES = require( '../config/indexes.json' );
const MONGO_URL = MONGO.url;
const MONGO_DB = 'UrbanScopeTest';
const COLLECTIONS = MONGO.collections;
const COLLECTION = 'posts';
const SAMPLE_DATA = require( './sample_data.json' );


// Connect to DB
before( function connectDatabase() {
  return db
  .open( MONGO_URL, MONGO_DB );
} );
// Init DB
before( function initDatabase() {
  db.mapping = COLLECTIONS;

  let actions = [];
  for( let name of Object.keys( INDEXES ) ) {
    let indexes = INDEXES[ name ];
    actions.push(
      db.indexes( name, indexes )
    );
  }

  return Promise
  .all( actions );
} );
// Add sample data
before( function addData() {
  let data = SAMPLE_DATA.map( d => {
    d.date = new Date( d.date );
    return d;
  } );

  return db
  .insert( COLLECTION, data );
} );

// Drop DB
after( function() {
  return db.dropDatabase();
} );
after( function() {
  return db.close();
} );