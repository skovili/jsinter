const fs = require('fs');
const path = require('path');

// Function to print usage information
const printUsage = () => {
    console.log('Usage: ./mini-ls [-r] [FILE...]');
    process.exit(1);
};

// Function to get file permissions in a human-readable format
const getPermissions = (stats) => {
    const mode = stats.mode;
    const isDirectory = stats.isDirectory() ? 'd' : '-';
    const ownerRead = mode & fs.constants.S_IRUSR ? 'r' : '-';
    const ownerWrite = mode & fs.constants.S_IWUSR ? 'w' : '-';
    const ownerExecute = mode & fs.constants.S_IXUSR ? 'x' : '-';
    const groupRead = mode & fs.constants.S_IRGRP ? 'r' : '-';
    const groupWrite = mode & fs.constants.S_IWGRP ? 'w' : '-';
    const groupExecute = mode & fs.constants.S_IXGRP ? 'x' : '-';
    const othersRead = mode & fs.constants.S_IROTH ? 'r' : '-';
    const othersWrite = mode & fs.constants.S_IWOTH ? 'w' : '-';
    const othersExecute = mode & fs.constants.S_IXOTH ? 'x' : '-';

    return `${isDirectory}${ownerRead}${ownerWrite}${ownerExecute}${groupRead}${groupWrite}${groupExecute}${othersRead}${othersWrite}${othersExecute}`;
};

// Function to get the owner ID
const getOwnerId = (stats) => {
    return stats.uid; // Returns the user ID of the file owner
};

// Function to format the modified time
const getModifiedTime = (stats) => {
    return stats.mtime.toLocaleString(); // Formats modification time
};

// Function to list information about a single file or directory
const listEntry = async (filePath, config) => {
    const stats = await fs.promises.stat(filePath);
    const ownerId = getOwnerId(stats);
    const permissions = getPermissions(stats);
    const modifiedTime = getModifiedTime(stats);

    console.log(`${permissions}  ${ownerId}  ${modifiedTime}  ${filePath}`);

    // If it's a directory and recursive option is set, list its contents
    if (stats.isDirectory() && config.recursive) {
        await listDir(filePath, config);
    }
};

// Function to read and list all entries in a directory
const listDir = async (dirPath, config) => {
    const files = await fs.promises.readdir(dirPath);
    for (const file of files) {
        const filePath = path.join(dirPath, file);
        await listEntry(filePath, config); // List each entry in the directory
    }
};

// Main function to execute mini-ls
const miniLs = async () => {
    const args = process.argv.slice(2);
    const config = { recursive: false, files: [] };

    // Parse command-line arguments
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '-r') {
            config.recursive = true; // Enable recursive option
        } else {
            config.files.push(args[i]); // Add file paths to the list
        }
    }

    // If no files are specified, list the current directory
    if (config.files.length === 0) {
        await listDir('.', config);
    } else {
        // List each specified file or directory
        for (const file of config.files) {
            await listEntry(file, config);
        }
    }
};

// Execute the main function
miniLs();
