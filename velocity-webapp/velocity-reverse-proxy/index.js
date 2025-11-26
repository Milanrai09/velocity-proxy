export default async function handler(req, res) {
    try {
        const hostname = req.headers.host;            // ex: testing123.velocity-reverse-proxy.vercel.app
        const subdomain = hostname.split('.')[0];     // ex: testing123

        const BASE_PATH = 'https://velocity-buildserver.s3.ap-south-1.amazonaws.com/__outputs';

        let path = req.url;

        // root → index.html
        if (path === '/' || path === '') {
            path = '/index.html';
        }

        const targetUrl = `${BASE_PATH}/${subdomain}${path}`;

        console.log(`Proxy → ${targetUrl}`);

        // Fetch the S3 file
        const s3Response = await fetch(targetUrl);

        if (!s3Response.ok) {
            res.status(s3Response.status).send("Error fetching file");
            return;
        }

        // Forward headers
        res.setHeader("Content-Type", s3Response.headers.get("content-type") || "application/octet-stream");

        // Send file
        const body = Buffer.from(await s3Response.arrayBuffer());
        res.status(200).send(body);

    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Proxy Error");
    }
}
