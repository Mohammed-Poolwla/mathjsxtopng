const mjAPI = require('mathjax-node');
const fs = require('fs');
const svg2img = require('svg2img');
var url = require('url');

// configure the MathJax API
mjAPI.config({
  MathJax: {
    // specify the output format as PNG
    SVG: {
      scale: 200 // set the scale of the PNG image
    },
    displayAlign: 'center', // center the PNG image vertically
    displayIndent: '0px' // remove the horizontal indent around the PNG image
  }
});

// start the MathJax API
mjAPI.start();

// define a function that converts a MathJax equation to a PNG image
function getEquationImage(equation) {
  return new Promise((resolve, reject) => {
    // use the MathJax API to convert the equation to a PNG image
    mjAPI.typeset({
      math: equation,
      format: 'TeX',
      svg: true
    }, (data) => {
      if (!data.errors) {
        // resolve the promise with the PNG image data
        svg2img(data.svg, async function(error, buffer) {
            resolve(buffer);
        });
        
      } else {
        // reject the promise with the MathJax errors
        reject(data.errors);
      }
    });
  });
}

// define an HTTP server that returns an image based on a MathJax equation
const http = require('http');
const server = http.createServer(async (req, res) => {
  var params = url.parse(req.url, true).query;

  // get the equation from the request URL
  console.log(params)
  if(params.eq){
    const equation = decodeURIComponent(params.eq);

    // generate the image based on the equation
    const image = await getEquationImage(equation);
    // set the response headers
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600');

    // write the image data to the response
    res.end(image);
  } else {
    res.end('')
  }
  
});

// start the HTTP server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
