//const KerberosTicketError = require('./errors/ticket.error.class');

class KerberosTicket {
	constructor(key_length, data) {
		this.pos = 0;
		this.data = data;

		this.key_length = key_length;

		this.key = this.data.subarray(0, this.key_length);
		this.unknown = this.data.subarray(this.key_length, this.key_length + 4).readUInt32LE();

		const u32 = this.data.subarray(this.key_length + 4, this.key_length + 8).readUInt32LE();
		this.buffer = this.data.subarray(this.key_length + 8, this.key_length + 8 + u32);
	}
}

module.exports = KerberosTicket;