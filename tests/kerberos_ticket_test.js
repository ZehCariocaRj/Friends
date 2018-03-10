const Kerberos = require('../lib/kerberos/kerberos.class');
const KerberosTicket = require('../lib/kerberos/ticket.class');
const crypto = require('crypto');

const config = require('./config.json');

const IS_FRIEND_SERVICE = true;

const PID = 1750087940;
const nex_password = config.NEX_Password;
const key = getKerberosKey(PID, nex_password);

const kerb = new Kerberos(key);

const decrypted = kerb.decrypt(Buffer.from('7f7c6442ed4047de0e10de4227d2dd562d36dd759054d751894e4c79abe5ef6cc5fb5b07a11113834468bc87b29602d21ffb327bc360b13961ea6f879d6858b1aecac9c1f4a0e6b968448433f32dc891efc8c5ec0f767faca3ff3541a0fb339f29ea912847f872b713b78eaa', 'hex'));

const ticket_key_length = (IS_FRIEND_SERVICE ? 16 : 32);

const ticket = new KerberosTicket(ticket_key_length, decrypted);

console.log(ticket.key.toString('hex'));
console.log(ticket.unknown);
console.log(ticket.buffer.toString('hex'));


function getKerberosKey(pid, password) {
	const times = 65000 + pid % 1024;
	let key = Buffer.from(password);

	for (let i=0;i<times;i++) {
		key = Buffer.from(crypto.createHash('md5').update(key).digest(), 'binary');
	}

	return key;
}