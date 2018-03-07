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

        for (let i of Array.apply(null, {length: 256}).map(Number.call, Number)) {
            t = (t + this.map[i] + this.key[i % this.key.length]) % 256;
            [this.map[i], this.map[t]] = [this.map[t], this.map[i]];
        }
    }

    crypt(data) {
        let output = [];
        if (typeof data !== 'object') {
            data = Buffer.from(data);
        }

        for (let bit of data) {
            let t1, t2;

            this.x = (this.x + 1) % 256;
            this.y = (this.y + this.map[this.x]) % 256;
            [t1, t2] = [this.map[this.y], this.map[this.x]];
            [this.map[this.x], this.map[this.y]] = [t1, t2];
            
            let mask = this.map[(t1 + t2) % 256];
            output.push(bit ^ mask);
        }
        this.reset();

        return Buffer.from(output)
    }
}

module.exports = RC4;