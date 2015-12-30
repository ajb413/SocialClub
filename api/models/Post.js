/**
* Post.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {

  	author: { model:'User', required: true }, //many in the one to many relationship

  	content: { type: 'string', required: true },

  	id: { type: 'string', unique: true, required: true, primaryKey: true  },

  	date: { type: 'string', required: true },

  }

};

