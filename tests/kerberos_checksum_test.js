const Kerberos = require('../lib/kerberos/kerberos.class');
const crypto = require('crypto');

const config = require('./config.json');

const PID = 1750087940;
const nex_password = config.NEX_Password;
const key = getKerberosKey(PID, nex_password);

const kerb = new Kerberos(key);

kerb.decrypt(Buffer.from('4a9e85ee9c5c9abe1f1a5ae1d4c7b8fe2e36dd759054d751894e4c791c22a7905bd2b3f72349029f5790d9c0b29602d2c236bd4a947ef3d80fbb3b37853f5df1d91360a9591d2b16524006b21ceea99caa65807837cd0f07790ee35e77852e8b410ab2bed2fed57008532d5e', 'hex'));


function getKerberosKey(pid, password) {
	const times = 65000 + pid % 1024;
	let key = Buffer.from(password);

	for (let i=0;i<times;i++) {
		key = Buffer.from(crypto.createHash('md5').update(key).digest(), 'binary');
	}

	return key;
}