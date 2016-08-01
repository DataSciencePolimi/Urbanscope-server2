'use strict';
/* eslint-disable no-unused-expressions */

let moment = require( 'moment' );
let db = require( 'db-utils' );

// Const
const MONGO = require( '../config/mongo.json' );
const INDEXES = require( '../config/mongo-indexes.json' );
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
  let data = SAMPLE_DATA.map( ( d, i ) => {

    d.date = moment.utc( d.date ).toDate();
    d.timestamp = d.date.getTime();

    d.id = d.id || 'ID:'+i;
    d.text = d.text || 'Text '+i;
    d.source = d.source || 'twitter';
    d.author = d.author || 'author '+i;
    d.authorId = d.authorId || 'AID:'+i;

    d.raw = d.raw || {};
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