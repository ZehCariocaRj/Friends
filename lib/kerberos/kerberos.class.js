const KerberosError = require('./errors/kerberos.error.class');
const RC4 = require('../rc4.class');
const crypto = require('crypto');

class Kerberos {
	constructor(kerberos_key) {
		if (!kerberos_key) {
			throw new KerberosError('No Kerberos key provided');
		}

		this.key = kerberos_key;
		this.cipher = new RC4(kerberos_key);
	}

	decrypt(packet) {
		const data = packet.subarray(0, -0x10);
		const checksum = packet.subarray(-0x10).toString('hex');

		let hmac = crypto.createHmac('md5', Buffer.from('b414e97ea31806b6f27591f7a1815817', 'hex'));
		hmac.update(data);
		hmac = hmac.digest('hex');

		if (checksum != hmac) {
			throw new KerberosError('Kerberos checksum does not match. Expected: ' + checksum + ', got: ' + hmac);
		}
		
		return this.cipher.crypt(data);
	}

	encrypt(packet) {
		const encrypted = this.cipher.crypt(packet);
		const hmac = crypto.createHmac('md5', this.key);
		
		hmac.update(encrypted);
		
		return Buffer.from(encrypted.toString('hex') + hmac.digest('hex'), 'hex');
	}
}

module.exports = Kerberos;