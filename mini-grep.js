const fs = require('fs');
const readline = require('readline');

const printUsage = () => {
    console.log('Usage: ./mini-grep [-q] -e PATTERN [FILE...]');
    process.exit(1);
}

const miniGrep = async (params) => {
    const regex = new RegExp(params.pattern, 'g');

    // Search in stdin
    if (params.files.length === 0) {
        const rl = readline.createInterface({ input: process.stdin });
        console.log("Enter the text to perform the search on or ctrl + c to stop");
        for await (const line of rl) {
            if (regex.test(line)) {
                // stdin is one line so it doesn't make sense to display the line number
                console.log(line);
            }
            console.log("Enter the text to perform the search on or ctrl + c to stop");
        }
        return;
    }

    // Search in files
    params.files.forEach(file => {
        if (!fs.existsSync(file)) {
            console.error(`Error: No such file '${file}'`);
            return;
        }
        const rl = readline.createInterface({ input: fs.createReadStream(file) });
        let lineNumber = 0;
        rl.on('line', (line) => {
            lineNumber++;
            if (regex.test(line)) {
                console.log(params.quiet ? line : `${file}:${lineNumber}:${line}`);
            }
        });
    });

}

const args = process.argv.slice(2);
const params = {
    quiet: false,
    pattern: null,
    files: []
}

for (let i = 0; i < args.length; i++) {
    if (args[i] === '-q') {
        params.quiet = true;
    } else if (args[i] === '-e' && i + 1 < args.length) {
        params.pattern = args[i + 1];
        i++;
    } else {
        params.files.push(args[i]);
    }
}

if (!params.pattern) {
    printUsage();
}

miniGrep(params);
