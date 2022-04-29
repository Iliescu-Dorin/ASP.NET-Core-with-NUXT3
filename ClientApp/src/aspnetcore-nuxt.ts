import path from 'path'
import fs from 'fs'


const baseFolder = process.env.APPDATA !== undefined && process.env.APPDATA !== ''
    ? `${process.env.APPDATA}/ASP.NET/https`
    : `${process.env.HOME}/.aspnet/https`;

const certArg = process.argv.map(arg => arg.match('--name=(?<value>.+)')).filter(Boolean)[0];
const certName = certArg ? certArg?.groups?.value : process?.env?.npm_package_name;

if (!certName) {
    console.error('Invalid certificate name. Run this script in the context of an npm/yarn script or pass --name=<<app>> explicitly');
    process.exit(-1);
}

export const certFilePath = path.join(baseFolder, `${certName}.pem`);
export const keyFilePath = path.join(baseFolder, `${certName}.key`);


const target = process.env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${process.env.ASPNETCORE_HTTPS_PORT}` :
process.env.ASPNETCORE_URLS ? process.env.ASPNETCORE_URLS.split(';')[0] : 'http://localhost:2118';

if (!fs.existsSync('.env.development.local')) {
    fs.writeFileSync(
        '.env.development.local',
        `SSL_CRT_FILE=${certFilePath}
            SSL_KEY_FILE=${keyFilePath}`,
    );
} else {
    let lines = fs.readFileSync('.env.development.local')
        .toString()
        .split('\n');

    let hasCert, hasCertKey = false;
    for (const line of lines) {
        if (/SSL_CRT_FILE=.*/i.test(line)) {
            hasCert = true;
        }
        if (/SSL_KEY_FILE=*/i.test(line)) {
            hasCertKey = true;
        }
    }

    if (!hasCert) {
        fs.appendFileSync(
            '.env.development.local',
            `\nSSL_CRT_FILE=${certFilePath}`
        );
    }
    if (!hasCertKey) {
        fs.appendFileSync(
            '.env.development.local',
            `\nSSL_KEY_FILE=${keyFilePath}`
        )
    }
}    

export const PROXY_CONFIG = [
    {
        context: [
            "/weatherforecast",
        ],
        target: target,
        secure: false,
        headers: {
            Connection: 'Keep-Alive'
        }
    }
]