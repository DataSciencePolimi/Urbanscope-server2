'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.TEST_ENV = process.env.TEST_ENV || 'test';

global.request = require( 'supertest' );
global.chai = require( 'chai' );
global.expect = global.chai.expect;

global.NUM_NILS = 88;
global.NUM_MUNICIPALITIES = 134;