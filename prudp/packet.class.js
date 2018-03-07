const PRUDPPacketError = require('./errors/packet.error.class');

const RC4 = require('./rc4.class');
const cipher = new RC4('CD&ML');

const TYPES = require('./types/packet.types');
const FLAGS = require('./types/flag.types');

class PRUDPPacket {

	constructor(raw, version = 1) {
		const type = typeof raw;

		switch (type) {
			case 'string':
				this.raw = raw || '';
				this.data = {};
				break;
			case 'object':
				this.raw = this.construct_packet(raw);
				this.data = raw;
				break;
			default:
				throw new PRUDPPacketError(`Invalid packet data type ${type}`);
		}

		this.version = version;
	}

	static verify_packet_data(raw) {
		if (!this.isHex(raw)) {
			throw new PRUDPPacketError('Invalid HEX data. Please provide valid HEX');
		}
	}

	static isHex(data) {
		return /^..([a-zA-Z0-9].)+$/g.test(data);
	}

	static map_constant(constants, value) {
		let mapped = null;
		for (const constant in constants) {
			if (constants.hasOwnProperty(constant)) {
				if (constants[constant] === value) {
					mapped = constant;
				}
			}
		}

		return mapped;
	}

	static get_flags(flag) {
		const flags = [];

		if (flag & FLAGS.ACK) {
			flags.push('ACK');
		}
		if (flag & FLAGS.HAS_SIZE) {
			flags.push('HAS_SIZE');
		}
		if (flag & FLAGS.MULTI_ACK) {
			flags.push('MULTI_ACK');
		}
		if (flag & FLAGS.NEED_ACK) {
			flags.push('NEED_ACK');
		}
		if (flag & FLAGS.RELIABLE) {
			flags.push('RELIABLE');
		}
		
		return flags;
	}

	static FloorDiv(a, b) {
		return Math.floor(a / b);
	}

	unpack() {
		this.constructor.verify_packet_data(this.raw);

		const buffer = Buffer.from(this.raw, 'hex');

		switch (this.version) {
			case 0:
				const type_flags = buffer.subarray(0x2, 0x4).readUInt16LE();
				const type = type_flags & 0xF;
				const flags = (type_flags & 0xFFF0) >> 4;

				const data = {
					ports: {
						source: buffer[0x00].toString(16),
						destination: buffer[0x01].toString(16)
					},
					type: type,
					type_string: this.constructor.map_constant(TYPES, type),
					flags: this.constructor.get_flags(flags),
					session_id: buffer[0x4],
					signature: buffer.subarray(0x5, 0x9).toString('hex'),
					sequence_id: buffer.subarray(0x9, 0xB).readUInt16LE(),
					connection_signature: null,
					fragment_id: null,
					size: null,
					header_size: 0,
					payload: {
						encrypted: null,
						decrypted: null,
						rmc: {
							type: null, //can be 0 for request, 1 for response
							size: null, //response doesn't have this; if response, can be left null
							protocol_id: null,
							call_id: null,
							method_id: null, //response doesn't have this; if response, can be left null
							method_parameters: null, //response doesn't have this; if response, can be left null
							error_success: null, //can be 0 for error, 1 for success; //request doesn't have this; if request, can be left null
							response_data: null, //error doesn't have this; if error, can be left null
							error_code: null, //success doesn't have this; if success, can be left null
						},
					},
				};

				if (data.type == TYPES.SYN || data.types == TYPES.CONNECT) {
					data.header_size = 15;
					data.connection_signature = buffer.subarray(0x0B, 0x0F).toString('hex');
				} else {
					data.header_size = 12;
					data.fragment_id = buffer[0x0B];
				}

				if (data.flags.includes('HAS_SIZE')) {
					data.size = buffer.subarray(data.header_size, data.header_size + 2).readUInt16LE();
					data.header_size += 2;

					data.payload.encrypted = buffer.subarray(data.header_size, data.header_size + data.size);
				}

				if (data.type == TYPES.DATA && !data.flags.includes('ACK')) {
					if (!data.size) {
						data.size = buffer.length - data.header_size - 1;
					}
					data.payload.encrypted = buffer.subarray(data.header_size, data.header_size + data.size);
				}
				
				if(data.type == TYPES.DATA && data.payload.encrypted != null){
					data.payload.decrypted = cipher.crypt(buffer.subarray(data.header_size, data.header_size + data.size));
					if(data.payload.decrypted != null){
						//TODO - disassemble payload
					}
				}

				this.data = data;

				return this.data;
			case 1:
				// Not implemented
				// Will use `unpack_header` method
				break;
			default:
				throw new PRUDPPacketError(`Invalid or unimplemented packet version ${this.version} provided`);
		}
	}

	unpack_header() {
		// Unpack V1 headers
	}

	decrypt() {
		// Decrypt payloads
	}

	construct_packet(json) {
		// Build packet
		// Requires the same JSON format as returned from the `unpack` method!
		let packet_header;
		//const packet_payload = new Buffer();
		//const packet_checksum = new Buffer();
		switch (this.version) {
			case 0:
				packet_header = Buffer.concat([Buffer.from(json.ports.source + json.ports.destination, 'hex')]);
				return packet_header;
			case 1:
				// Not implemented
				// Will use `unpack_header` method
				break;
			default:
				throw new PRUDPPacketError(`Invalid or unimplemented packet version ${this.version} provided`);
		}
	}

	calc_checksum(checksum, packet) {
		const tuple = [];
		let pos = 0;

		for (let i=0;i<this.constructor.FloorDiv(packet.length, 4);i++) {
			tuple.push(packet.readUInt32LE(pos, true));
			pos += 4;
		}

		const sum = tuple.reduce((a, b) => {
			return a + b;
		}, 0);
		const temp = (sum & 0xFFFFFFFF) >>> 0;

		checksum += packet.subarray(-((packet.length & 3) >>> 0)).reduce((a, b) => {
			return a + b;
		}, 0);

		const buff = Buffer.alloc(4);
		buff.writeUInt32LE(temp, 0);

		checksum += buff.reduce((a, b) => {
			return a + b;
		}, 0);

		return (checksum & 0xFF) >>> 0;
	}
}

module.exports = PRUDPPacket;