const { Address } = require('@stellar/stellar-sdk');

const testID = 'CDLZFC3SYJYDZT7K67VZ75YJBMKBAV26RZ6SNTLMHRPZ2RV7GT3S6YTM';
try {
  const addr = new Address(testID);
  console.log('Valid Address:', addr.toString());
} catch (e) {
  console.error('Invalid Address:', e.message);
}
