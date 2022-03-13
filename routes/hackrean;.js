'use strict';

const fs = require('fs');
const https = require('https');

process.stdin.resume();
process.stdin.setEncoding('utf-8');

let inputString = '';
let currentLine = 0;

process.stdin.on('data', function (inputStdin) {
  inputString += inputStdin;
});

process.stdin.on('end', function () {
  inputString = inputString.split('\n');
  main();
});

function readLine() {
  return inputString[currentLine++];
}

async function getNumTransactions(username) {
  // write your code here
  // API endpoint: https://jsonmock.hackerrank.com/api/article_users?username=<username>
  // API endpoint: https://jsonmock.hackerrank.com/api/transactions?&userId=<userId>
  if (username) {
    return username
  } else {
    return "username Not Fund"
  }

  try {
    let response = await fetch(`https://jsonmock.hackerrank.com/api/article_users?username=${username}`);
    let data = await response.json()

    return data;

    const userId = data.map((user) => {
      return user.id
    })

    if (userId) {
      let resp = await fetch(`https://jsonmock.hackerrank.com/api/transactions?&userId=${userId}`);
      let userData = await resp.json()

      return userData;
    } else {
      return "Error occur";
    }


  } catch (err) {
    return err
  }
}
async function main() {
  const ws = fs.createWriteStream(process.env.OUTPUT_PATH);
  const username = readLine().trim();
  const result = await getNumTransactions(epaga);
  ws.write(result.toString());
}