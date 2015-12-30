/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {

  	email: { type: 'email', required: true, unique: true },

  	password: { type: 'string', required: true, maxLength: 25 },

  	name: { type: 'string', required: true },

  	car: { type: 'string', required: true },

    permissions: { type: 'string', required: true },

    avatar: { type: 'text', maxLength: 280000, defaultsTo: Util.DefaultAvatar },

    id: { type: 'string', unique: true, required: true, primaryKey: true },

    lastHomepageLoad: { type: 'string', defaultsTo: "1" },

    posts: { collection: 'Post', via: 'author' } //one in the one to many relationship

  },

  seedData:[
    {
    	email:'admin@sc.com',
    	password:'admin',
    	name:'Admin',
    	car:'Lexus RX450h',
    	permissions: 'senior',
      id: Util.newGuid(),
      lastHomepageLoad: "1",
      avatar: Util.DefaultAvatar
    },
  ],
  
};

