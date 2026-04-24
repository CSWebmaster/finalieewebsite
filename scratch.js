const fs = require('fs');

async function test() {
  const url = "https://docs.google.com/forms/d/e/1FAIpQLSdO2nONg9zQ4T3t0P38k2_a7oY9b01t3p1o0O12J0F12h1xTg/viewform";
  try {
    const res = await fetch(url);
    const text = await res.text();
    const match = text.match(/var FB_PUBLIC_LOAD_DATA_ = (\[.*?\]);\s*<\/script>/s);
    if(match) {
        const data = JSON.parse(match[1]);
        console.log("Title:", data[1][8]);
        console.log("Desc:", data[1][0]);
        const items = data[1][1];
        items.forEach(i => {
        console.log("Item:", i[1], "Type:", i[3]);
        });
    } else {
        console.log("no match against url");
    }
  } catch (e) {
      console.error(e);
  }
}
test();
