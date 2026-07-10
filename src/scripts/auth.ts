import readline from 'readline';
import { getAuthUrl, getAndSaveTokens } from '../auth/oauth.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  const authUrl = getAuthUrl();
  console.log('Authorize this app by visiting this url:');
  console.log(authUrl);

  rl.question('Enter the code from that page here: ', async (code) => {
    try {
      await getAndSaveTokens(code);
      console.log('Authentication successful!');
    } catch (error) {
      console.error('Error retrieving access token', error);
    } finally {
      rl.close();
    }
  });
}

main().catch(console.error);
