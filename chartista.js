/**
*
* ChartistaJS
*
* Author: Sebastian Dahlgren <sebastian.dahlgren@gmail.com>
* Website: https://github.com/sebdah/chartista.js
*/

/**
* Main class for ChartistaJS. Responsible for setting up the configuration
*/
function ChartistaJS (canvasId, config, logLevel) {
  // Set the log level
  this.logLevel = typeof logLevel !== 'undefined' ? logLevel : 'INFO';
  this.logInfo("Setting log level to " + this.logLevel);

  this.logDebug("Working with canvasId " + canvasId);

  // Get the canvas object
  this.canvas = document.getElementById(canvasId);
  this.ctx = this.canvas.getContext("2d");

  // Set default properties
  this.config = config;
  this.config['backgroundColor'] = typeof this.config['backgroundColor'] !== 'undefined' ? this.config['backgroundColor'] : '#ff0000';
  this.config['padding'] = typeof this.config['padding'] !== 'undefined' ? this.config['padding'] : 0;

  // Log the configuration object
  this.logDebug('Configuration object', this.config);

  // Set properties
  this.backgroundColor = config['backgroundColor'];
  this.canvasWidth = this.canvas.width - (this.config['padding'] * 2);
  this.canvasHeight = this.canvas.height - (this.config['padding'] * 2);
}

ChartistaJS.prototype.lineChart = function() {
  // Basic variable setup
  var yLabelWidth = 0;
  var xLabelHeight = 0;
  var graphHeight = this.canvasHeight - xLabelHeight - 50;
  var graphWidth = this.canvasWidth - yLabelWidth - 80;
  var scale = 0;
  var maxValue = 0;
  var minValue = 0;

  // Render the background
  this.renderBackground();

  // Calculate min and max values
  getMinAndMaxValue();
  maxValue = maxValue * 1.05; // 5% padding
  minValue = minValue * 0.95; // 5% padding

  // Calculate scale
  scale = graphHeight / maxValue;

  // Loop over the datasets
  for (var i = 0; i < this.config.datasets.length; i++) {
    this.logDebug('Rendering dataset ' + eval(i+1) + ' of ' + this.config.datasets.length);

    dataset = this.config.datasets[i];

    // Set the starting point for X
    startX = parseFloat(((this.canvas.width - graphWidth) - this.config['padding']).toFixed(2));
    xStepSize = parseFloat((graphWidth / (dataset.data.length - 1)).toFixed(2));

    // Begin the rendering
    this.ctx.beginPath();
    this.ctx.strokeStyle = typeof dataset['strokeStyle'] !== 'undefined' ? dataset['strokeStyle'] : '#ffffff';
    this.ctx.lineWidth = typeof dataset['lineWidth'] !== 'undefined' ? dataset['lineWidth'] : 2;

    // Reset x
    x = startX;

    // Calculate the data points
    points = []
    for (var j = 0; j < this.config['labels'].length; j++) {
      points.push({
        'x': xLabelHeight + graphWidth / (this.config['labels'].length - 1) * (j + 1),
        'y': parseFloat((graphHeight - (dataset.data[j] * scale)).toFixed(2))
      })
    }
    this.logDebug('points', points);

    // Render each data point
    this.ctx.moveTo(points[0].x, points[0].y);
    for (var j = 1; j < points.length; j++) { this.ctx.lineTo(points[j].x, points[j].y); }
    this.ctx.stroke();

    // Fill the graph
    if (typeof dataset['fill'] !== 'undefined' ? dataset['fill'] : true) {
      // Begin the rendering
      this.ctx.beginPath();
      this.ctx.strokeStyle = typeof dataset['fillStyle'] !== 'undefined' ? dataset['fillStyle'] : '#ffffff';
      this.ctx.lineWidth = 0.1;

      // Render each data point
      this.ctx.moveTo(points[0].x, points[0].y);
      for (var j = 1; j < points.length; j++) { this.ctx.lineTo(points[j].x, points[j].y); }
      this.ctx.stroke();

      // Make the graph complete
      this.ctx.lineTo(points[points.length - 1].x, graphHeight);
      this.ctx.lineTo(points[0].x, graphHeight);
      this.ctx.lineTo(points[0].x, points[0].y);
      this.ctx.stroke();

      // Fill the graph
      this.ctx.fillStyle = typeof dataset['fillStyle'] !== 'undefined' ? dataset['fillStyle'] : '#ffffff';
      this.ctx.fill();
    }
  }

  // Calculate the maxValue
  function getMinAndMaxValue () {
    for (var i = 0; i < this.config.datasets.length; i++) {
      dataset = this.config.datasets[i];
      for (var j = 0; j < dataset.data.length; j++) {
        if (dataset.data[j] > maxValue) { maxValue = dataset.data[j]; }
        if (dataset.data[j] < minValue) { minValue = dataset.data[j]; }
      }
    }
  }
};

/**
* Render chart background
*/
ChartistaJS.prototype.renderBackground = function() {
  this.logDebug('Rendering background color (' + this.backgroundColor + ')');
  this.ctx.fillStyle = this.backgroundColor;
  this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
};


/**
* Log debug message to console
*/
ChartistaJS.prototype.logDebug = function (message, object) {
  this.log(message, 0, object);
};

/**
* Log error message to console
*/
ChartistaJS.prototype.logError = function (message, object) {
  this.log(message, 3, object);
};

/**
* Log info message to console
*/
ChartistaJS.prototype.logInfo = function (message, object) {
  this.log(message, 1, object);
};

/**
* Log warning message to console
*/
ChartistaJS.prototype.logWarning = function (message, object) {
  this.log(message, 2, object);
};

/**
* Log message to console
*/
ChartistaJS.prototype.log = function (message, level, object) {
  levelNameToId = { 'DEBUG': 0, 'INFO': 1, 'WARN': 2, 'ERROR': 3 }
  levelIdToName = { 0: 'DEBUG', 1: 'INFO', 2: 'WARN', 3: 'ERROR' }

  function padWithZero(i) { return (i < 10) ? "0" + i : "" + i; }

  if (level >= levelNameToId[this.logLevel]) {
    var tempDate = new Date();
    var dateStr = padWithZero(tempDate.getFullYear()) + '-' +
                  padWithZero(1 + tempDate.getMonth()) + '-' +
                  padWithZero(tempDate.getDate()) + 'T' +
                  padWithZero(tempDate.getHours()) + ':' +
                  padWithZero(tempDate.getMinutes()) + ':' +
                  padWithZero(tempDate.getSeconds());

    console.log(dateStr + ' - ' + levelIdToName[level] + ' - ' + message);
    if (typeof(object) !== 'undefined') { console.dir(object); }
  }
};
