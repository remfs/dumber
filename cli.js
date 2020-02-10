#!/usr/bin/env node

const process = require('process');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const sharp = require('sharp');

if (process.argv.length < 5) {
  console.error("Usage: dumber SRC_DIR DST_DIR IMAGE_HEIGHT");
  process.exit(1);
}

const rootSrcDir = process.argv[2];
const rootDstDir = process.argv[3];
const height = Number(process.argv[4]);

const outBasename = path.basename(rootDstDir);
console.log(outBasename);

if (rootSrcDir === rootDstDir) {
  console.error("SRC_DIR and DST_DIR can't be the same");
  process.exit(1);
}

async function dumbDir(srcDir, dstDir) {


  try {
    await fs.promises.mkdir(dstDir);
  }
  catch (e) {
    //console.error(e);
  }

  let childNames;
  try {
    childNames = await fs.promises.readdir(srcDir);
  }
  catch (e) {
    console.error(e);
    return;
  }

  for (const childName of childNames) {
    if (childName === outBasename) {
      continue;
    }

    let stats;
    const srcChildPath = path.join(srcDir, childName);
    const dstChildPath = path.join(dstDir, childName);
    try {
      stats = await fs.promises.stat(srcChildPath);
    }
    catch (e) {
      console.error(e);
      return;
    }

    if (stats.isDirectory()) {
      await dumbDir(srcChildPath, dstChildPath);
    }
    else {
      if (!isImage(childName)) {
        continue;
      }

      console.log(srcChildPath, dstChildPath);

      //const epeg = spawnSync('epeg', ['-p', '-h', height, srcChildPath, dstChildPath]);
      //console.log(epeg.stdout.toString('utf8'));

      sharp(srcChildPath)
        .resize(null, height)
        .toFile(dstChildPath)
    }
  }
}

function isImage(filename) {
  return filename.endsWith('.jpg') || 
    filename.endsWith('.jpeg') ||
    filename.endsWith('JPG') ||
    filename.endsWith('JPEG');
}

dumbDir(rootSrcDir, rootDstDir);
