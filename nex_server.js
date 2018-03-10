const PRUDPPacket = require('./lib/prudp/packet.class');
const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const port = 1300;
let logline = 0;

server.on('error', (err) => {
	console.log(`server error:\n${err.stack}`);
	server.close();
});

server.on('message', (data, remote) => {
	console.log(`${logline}: ${remote.address}:${remote.port} - ` + Buffer.from(data,'ascii').toString('hex'));

	const packet = new PRUDPPacket(Buffer.from(data,'ascii').toString('hex'), 0);
	packet.unpack();

	console.log(`${logline}: ${remote.address}:${remote.port} - ${packet.data.type_string}; ${packet.data.flags}`);
	
	logline++;
});

server.on('listening', () => {
	const address = server.address();
	console.log(`Friends server listening on ${address.address}:${address.port}`);
});

server.bind(port);

/*let packet = new PRUDPPacket('afa1620095b7625aab020000198744db99f82c5005a361fd2a1df280c863d6c5af619b286aeff6', 0);
packet.unpack();

console.log(packet.data);*/