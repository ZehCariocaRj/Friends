const PRUDPPacket = require('../lib/prudp/packet.class');

const packet = new PRUDPPacket('afa1620095b7625aab020000198744db99f82c5005a361fd2a1df280c863d6c5af619b286aeff6', 0);
packet.unpack();

console.log(packet.data);