import fs from 'fs';

const adminServicePath = 'D:\\skinid-web-extracted\\src\\features\\admin\\services\\adminService.js';
let content = fs.readFileSync(adminServicePath, 'utf8');

const targetStr = 'remotePosts.forEach((p) => mergedMap.set(p.id, p));';
if (content.includes(targetStr)) {
  content = content.replace(
    /remotePosts\.forEach\(\(p\) => mergedMap\.set\(p\.id, p\)\);\s*localPosts\.forEach\(\(p\) => mergedMap\.set\(p\.id, \{ \.\.\.\(mergedMap\.get\(p\.id\) \|\| \{\}\), \.\.\.p \}\)\);/,
    `localPosts.forEach((p) => mergedMap.set(p.id, p));\n        remotePosts.forEach((p) => mergedMap.set(p.id, { ...(mergedMap.get(p.id) || {}), ...p }));`
  );
  fs.writeFileSync(adminServicePath, content, 'utf8');
  console.log('Fixed Blog merge priority in adminService.js!');
} else {
  console.log('Target string not found in adminService.js');
}
