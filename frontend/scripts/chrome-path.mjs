const { executablePath } = await import('puppeteer');
process.stdout.write(await executablePath());

