const mongodb = require('mongodb');
const schema = require('../schema/usuarios')

async function generateUniqueId() {
  let uniqueId;
  
  do {
    uniqueId = generateId();
    const count = await schema.countDocuments({ id: uniqueId })
    if (count === 0) {
      break;
    }
  } while (true);

  return uniqueId;
}

function generateId() {
  const timestamp = (new Date().getTime() / 1000 | 0).toString(16);
  return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function() {
    return (Math.random() * 16 | 0).toString(16);
  }).toLowerCase();
}

module.exports = generateUniqueId;