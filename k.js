const Kerberos = require('./prudp/kerberos.class');
const crypto = require('crypto');

const PID = 4178013331; // random user PID from Pretendo database
const nex_password = '12345'; // random
const key = getKerberosKey(PID, nex_password);

const kerb = new Kerberos(key);

const encrypted = kerb.encrypt(Buffer.from('1234567891011121314151617181920'));
const decrypted = kerb.decrypt(encrypted);

console.log(encrypted);
console.log(decrypted.toString());

function getKerberosKey(pid, password) {
	const times = (65000 + Number(pid)) % 1024;
	let key = password;

	for (let i=0;i<times;i++) {
		key = crypto.createHash('md5').update(key).digest('hex');
	}

	return key.toString();
}