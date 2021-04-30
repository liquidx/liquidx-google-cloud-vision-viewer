
let _detectionResult = null;
let _imageObject = null;

const isWordAtExtremeAngle = (word) => {
  const v = word.boundingBox.vertices
  const line1 = {x1: v[0].x, y1: v[0].y, x2: v[1].x, y2: v[1].y}
  const angle = Math.atan2(Math.abs(line1.y2 - line1.y1), Math.abs(line1.x2 - line1.x1))
  const hRange = {min: -0.2, max: 0.2}
  const vRange = {min: 2.90, max: 3.40}
  if ((hRange.min < angle && angle < hRange.max) || (vRange.min < angle && angle < vRange.max)) {
    return false;
  }
  return true;
}

const wordAngle = (word) => {
  const v = word.boundingBox.vertices
  const line1 = {x1: v[0].x, y1: v[0].y, x2: v[1].x, y2: v[1].y}
  return Math.atan2(Math.abs(line1.y2 - line1.y1), Math.abs(line1.x2 - line1.x1))  
}

const wordHeight = (word) => {
  // First line is horizontal, second line is vertical. Measure the distance of the second line
  // to come up with the word height.
  const v = word.boundingBox.vertices
  const line1 = {x1: v[0].x, y1: v[0].y, x2: v[1].x, y2: v[1].y}
  const line2 = {x1: v[1].x, y1: v[1].y, x2: v[2].x, y2: v[2].y}
  return Math.floor(Math.sqrt(Math.pow(line2.x2 - line2.x1, 2) + Math.pow(line2.y2 - line2.y1, 2)))
}

const createImage = (url, attachFn) => {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    img.classList.add('load-image')
    img.src = url;
    img.addEventListener("load", (e) => {
      resolve(img);
    });
    img.addEventListener("error", (e) => {
      reject(img);
    });
  });
};

const drawBoundingBox = (context, vertices, color) => {
  // const vertices = o.vertices
  const origin = vertices[0];
  context.strokeStyle = color;
  context.beginPath();
  context.moveTo(origin.x, origin.y);
  vertices.slice(1).forEach((v) => {
    context.lineTo(v.x, v.y);
  });
  context.lineTo(origin.x, origin.y);
  context.stroke();
  context.closePath();
};

const draw = (canvas, imageElement, detectionResult) => {
  const annotations = detectionResult ? detectionResult.fullTextAnnotation.pages[0] : {};

  const context = canvas.getContext("2d");
  if (imageElement) {
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    canvas.style.width = imageElement.width;
    canvas.style.height = imageElement.height;
    context.drawImage(imageElement, 0, 0);
  }

  if (annotations.blocks) {
    annotations.blocks.forEach((block) => {
      console.log(block);
      const vertices = block.boundingBox.vertices;
      drawBoundingBox(context, vertices, "black");

      console.log(block.paragraphs.length);
      block.paragraphs.forEach((paragraph) => {
        console.log(paragraph);
        drawBoundingBox(context, paragraph.boundingBox.vertices, "blue");

        const words = paragraph.words.map((word) => {
          drawBoundingBox(context, word.boundingBox.vertices, "red");
          return word.symbols.map((symbol) => symbol.text).join("");
        });
        console.log(words);
      });
    });
  }
};

const detectionResultElements = (detectionResult) => {
  const annotations = detectionResult.fullTextAnnotation.pages[0]

  const results = document.createElement("div")
  results.classList.add('detection-data')
  annotations.blocks.forEach((block) => {
    let blockEl = document.createElement("div");
    blockEl.classList.add("block");
    results.appendChild(blockEl);

    block.paragraphs.forEach((paragraph) => {
      let paragraphEl = document.createElement("div");
      paragraphEl.classList.add("paragraph");
      blockEl.appendChild(paragraphEl);

      paragraph.words.forEach((word) => {
        let wordEl = document.createElement("div");
        wordEl.classList.add("word");
        wordEl.innerText = word.symbols.map((symbol) => symbol.text).join("");
        wordEl.setAttribute('title',wordHeight(word))
        if (isWordAtExtremeAngle(word)) {
          wordEl.classList.add("angle")
        }
        paragraphEl.appendChild(wordEl);
      });
    });
  });
  return results
};

const dropFile = async (e) => {
  console.log('drop')
  document.querySelector('main').classList.remove('over')
  const canvas = document.querySelector("canvas#canvas")

  e.preventDefault()

  let droppedFiles = e.dataTransfer.files;
  if (!droppedFiles) {
    console.log('No files')
    return;
  }

  console.log(droppedFiles)
  for (let f of droppedFiles) {
    if (f.type.startsWith('text') || f.type === 'application/json') {
      const text = await f.text()
      const json = JSON.parse(text)
      if (json.fullTextAnnotation) {
        _detectionResult = json
      } else if (json.blocks) { // Allow for a JSON file with only the fullTextAnnotation.pages[0] contents.
        _detectionResult = { fullTextAnnotation: { pages: [ json ] } }
      }
      redraw();
    } else if (f.type.startsWith('image')) {
      _imageUrl = URL.createObjectURL(f)
      createImage(_imageUrl, e => document.body.appendChild(e)).then(image => {
        _imageObject = image;
        redraw();
      })
    }
  }
  return true;
}

const dragOver = (e) => {
  e.preventDefault();
  document.querySelector('main').classList.add('over')
}

const redraw = () => {
  const canvas = document.querySelector("canvas#canvas")
  const blocks = document.querySelector('#blocks')
  console.log('redraw', _detectionResult);
  draw(canvas, _imageObject, _detectionResult);
  blocks.childNodes.forEach(e => e.parentElement.removeChild(e))
  blocks.appendChild(detectionResultElements(_detectionResult))
}

const start = () => {
  console.log('start')
  document.querySelector('main').addEventListener('drop', dropFile)
  document.querySelector('main').addEventListener('dragover', dragOver)
}

document.addEventListener('DOMContentLoaded', start)