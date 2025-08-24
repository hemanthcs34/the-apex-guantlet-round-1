/** @type {import('next').NextConfig} */
const nextConfig = {
    // any specific Next.js configurations can go here
    server:{
        proxy:{
            '/api':'http://localhost:3001'
        }
    }
};

export default nextConfig;