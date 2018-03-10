class RC4 {
	constructor(key) {
		this.key = Buffer.from(key);
		this.reset();
	}

	reset() {
		this.map = Array.apply(null, {length: 256}).map(Number.call, Number);
		this.x = 0;
		this.y = 0;

		let t = 0;

		for (const i of Array.apply(null, {length: 256}).map(Number.call, Number)) {
			t = (t + this.map[i] + this.key[i % this.key.length]) % 256;
			[this.map[i], this.map[t]] = [this.map[t], this.map[i]];
		}
	}

	crypt(data) {
		const output = [];
		if (typeof data !== 'object') {
			data = Buffer.from(data);
		}

		for (const bit of data) {this.x = (this.x + 1) % 256;
			this.y = (this.y + this.map[this.x]) % 256;

			const t1 = this.map[this.y];
			const t2 = this.map[this.x];

			this.map[this.x] = t1;
			this.map[this.y] = t2;
			
			output.push(bit ^ this.map[(t1 + t2) % 256]);
		}
		this.reset();

		return Buffer.from(output);
	}
}

module.exports = RC4;