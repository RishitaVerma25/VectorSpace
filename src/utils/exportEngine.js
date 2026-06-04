export const downloadFile = (filename, content, type = 'text/plain') => {
  const element = document.createElement('a');
  const file = new Blob([content], { type: type });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

export const exportW3CTokens = (workspaceAssets, workspaceName) => {
  const tokens = {};
  workspaceAssets.forEach(a => {
    const key = a.name.toLowerCase().replace(/\s+/g, '-');
    if (a.type === 'color') {
      tokens[key] = { $value: a.value, $type: 'color' };
    } else if (a.type === 'typography') {
      tokens[key] = {
        $value: { fontFamily: a.value.fontFamily, fontSize: a.value.fontSize, fontWeight: a.value.fontWeight },
        $type: 'typography'
      };
    } else if (a.type === 'shadow') {
      tokens[key] = {
        $value: { offsetX: a.value.x, offsetY: a.value.y, blur: a.value.blur, spread: a.value.spread, color: a.value.color },
        $type: 'shadow'
      };
    } else if (a.type === 'gradient') {
      tokens[key] = { $value: a.value, $type: 'gradient' };
    }
  });
  
  downloadFile(`${workspaceName.toLowerCase().replace(/\s+/g, '-')}-tokens.json`, JSON.stringify(tokens, null, 2), 'application/json');
};

export const generateThemeCSS = (workspaceAssets) => {
  let css = `:root {\n`;
  workspaceAssets.forEach(a => {
    const name = a.name.toLowerCase().replace(/\s+/g, '-');
    if (a.type === 'color') css += `  --color-${name}: ${a.value};\n`;
    else if (a.type === 'gradient') css += `  --gradient-${name}: ${a.value};\n`;
    else if (a.type === 'shadow') css += `  --shadow-${name}: ${a.value};\n`;
    else if (a.type === 'typography') css += `  --font-${name}: ${a.value};\n`;
  });
  css += `}\n`;
  return css;
};

export const exportZip = (assets, workspaceName) => {
  const files = [];

  const tokens = {};
  assets.forEach(a => {
    const key = a.name.toLowerCase().replace(/\s+/g, '-');
    if (a.type === 'color') tokens[key] = { $value: a.value, $type: 'color' };
    else if (a.type === 'gradient') tokens[key] = { $value: a.value, $type: 'gradient' };
  });
  files.push({ name: 'tokens.json', data: new TextEncoder().encode(JSON.stringify(tokens, null, 2)) });
  files.push({ name: 'theme.css', data: new TextEncoder().encode(generateThemeCSS(assets)) });

  assets.filter(a => a.type === 'svg').forEach(a => {
    files.push({ name: `icons/${a.name.toLowerCase().replace(/\s+/g, '-')}.svg`, data: new TextEncoder().encode(a.value) });
  });

  let out = [];
  let cd = [];
  let offset = 0;

  for (const file of files) {
    const nameBuf = new TextEncoder().encode(file.name);
    
    const lfh = new Uint8Array(30 + nameBuf.length);
    const lfhView = new DataView(lfh.buffer);
    lfhView.setUint32(0, 0x04034b50, true);
    lfhView.setUint16(4, 10, true);
    lfhView.setUint16(6, 8, true);
    lfhView.setUint16(8, 0, true);
    lfhView.setUint16(26, nameBuf.length, true);
    lfh.set(nameBuf, 30);

    const dataDesc = new Uint8Array(16);
    const ddView = new DataView(dataDesc.buffer);
    ddView.setUint32(0, 0x08074b50, true);
    ddView.setUint32(4, 0, true);
    ddView.setUint32(8, file.data.length, true);
    ddView.setUint32(12, file.data.length, true);

    const cdh = new Uint8Array(46 + nameBuf.length);
    const cdhView = new DataView(cdh.buffer);
    cdhView.setUint32(0, 0x02014b50, true);
    cdhView.setUint16(4, 10, true);
    cdhView.setUint16(6, 10, true);
    cdhView.setUint16(8, 8, true);
    cdhView.setUint16(10, 0, true);
    cdhView.setUint32(20, file.data.length, true);
    cdhView.setUint32(24, file.data.length, true);
    cdhView.setUint16(28, nameBuf.length, true);
    cdhView.setUint32(42, offset, true);
    cdh.set(nameBuf, 46);

    out.push(lfh, file.data, dataDesc);
    cd.push(cdh);
    offset += lfh.length + file.data.length + dataDesc.length;
  }

  const cdBuf = new Uint8Array(cd.reduce((acc, v) => acc + v.length, 0));
  let cdOffset = 0;
  for (const c of cd) {
    cdBuf.set(c, cdOffset);
    cdOffset += c.length;
  }

  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);
  eocdView.setUint32(0, 0x06054b50, true);
  eocdView.setUint16(8, files.length, true);
  eocdView.setUint16(10, files.length, true);
  eocdView.setUint32(12, cdBuf.length, true);
  eocdView.setUint32(16, offset, true);

  const zipBlob = new Blob([...out, cdBuf, eocd], { type: 'application/zip' });
  const element = document.createElement('a');
  element.href = URL.createObjectURL(zipBlob);
  element.download = `${workspaceName.toLowerCase().replace(/\s+/g, '-')}-bundle.zip`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};
