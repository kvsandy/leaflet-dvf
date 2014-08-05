/*
 @preserve Leaflet Tile Filters, a JavaScript plugin for apply image filters to tile images
 (c) 2014, Scott Fairgrieve, HumanGeo
*/
L.Color = L.Class.extend({
    initialize: function(colorDef) {
        this._rgb = [ 0, 0, 0 ];
        this._hsl = [ 0, 1, .5 ];
        this._a = 1;
        if (colorDef) {
            this.parseColorDef(colorDef);
        }
    },
    parseColorDef: function(colorDef) {},
    rgbToHSL: function(r, g, b) {
        r /= 255, g /= 255, b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;
        if (max == min) {
            h = s = 0;
        } else {
            var d = max - min;
            s = l > .5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
              case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;

              case g:
                h = (b - r) / d + 2;
                break;

              case b:
                h = (r - g) / d + 4;
                break;
            }
            h /= 6;
        }
        return [ h, s, l ];
    },
    hslToRGB: function(h, s, l) {
        var r, g, b;
        if (s == 0) {
            r = g = b = l;
        } else {
            function hue2rgb(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            }
            var q = l < .5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return [ Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255) ];
    },
    setRGB: function(r, g, b) {
        this._rgb = [ r, g, b ];
        this._hsl = this.rgbToHSL(r, g, b);
        return this;
    },
    setHSL: function(h, s, l) {
        this._hsl = [ h, s, l ];
        this._rgb = this.hslToRGB(h, s, l);
        return this;
    },
    toHSL: function() {
        return this._hsl;
    },
    toHSLString: function() {
        var prefix = "hsl";
        if (this._a < 1) {
            prefix += "a";
        }
        return prefix + "(" + (this._hsl[0] * 360).toFixed(1) + "," + (this._hsl[1] * 100).toFixed(0) + "%," + (this._hsl[2] * 100).toFixed(0) + "%)";
    },
    toRGB: function() {
        return this._rgb;
    },
    toRGBString: function() {
        var rgbString;
        if (this._a < 1) {
            rgbString = "rgba(" + this._rgb[0].toFixed(0) + "," + this._rgb[1].toFixed(0) + "," + this._rgb[2].toFixed(0) + "," + this._a.toFixed(1) + ")";
        } else {
            var parts = [ this._rgb[0].toString(16), this._rgb[1].toString(16), this._rgb[2].toString(16) ];
            for (var i = 0; i < parts.length; ++i) {
                if (parts[i].length === 1) {
                    parts[i] = "0" + parts[i];
                }
            }
            rgbString = "#" + parts.join("");
        }
        return rgbString;
    },
    r: function(newR) {
        if (!arguments.length) return this._rgb[0];
        return this.setRGB(newR, this._rgb[1], this._rgb[2]);
    },
    g: function(newG) {
        if (!arguments.length) return this._rgb[1];
        return this.setRGB(this._rgb[0], newG, this._rgb[2]);
    },
    b: function(newB) {
        if (!arguments.length) return this._rgb[2];
        return this.setRGB(this._rgb[0], this._rgb[1], newB);
    },
    h: function(newH) {
        if (!arguments.length) return this._hsl[0];
        return this.setHSL(newH, this._hsl[1], this._hsl[2]);
    },
    s: function(newS) {
        if (!arguments.length) return this._hsl[1];
        return this.setHSL(this._hsl[0], newS, this._hsl[2]);
    },
    l: function(newL) {
        if (!arguments.length) return this._hsl[2];
        return this.setHSL(this._hsl[0], this._hsl[1], newL);
    },
    a: function(newA) {
        if (!arguments.length) return this._a;
        this._a = newA;
        return this;
    }
});

L.RGBColor = L.Color.extend({
    initialize: function(colorDef) {
        L.Color.prototype.initialize.call(this, colorDef);
    },
    parseColorDef: function(colorDef) {
        var isArray = colorDef instanceof Array;
        var isHex = colorDef.indexOf("#") === 0;
        var parts = [];
        var r, g, b, a;
        if (isArray) {
            r = Math.floor(colorDef[0]);
            g = Math.floor(colorDef[1]);
            b = Math.floor(colorDef[2]);
            a = colorDef.length === 4 ? colorDef[3] : 1;
        } else if (isHex) {
            colorDef = colorDef.replace("#", "");
            r = parseInt(colorDef.substring(0, 2), 16);
            g = parseInt(colorDef.substring(2, 4), 16);
            b = parseInt(colorDef.substring(4, 6), 16);
            a = colorDef.length === 8 ? parseInt(colorDef.substring(6, 8), 16) : 1;
        } else {
            parts = colorDef.replace("rgb", "").replace("a", "").replace(/\s+/g, "").replace("(", "").replace(")", "").split(",");
            r = parseInt(parts[0]);
            g = parseInt(parts[1]);
            b = parseInt(parts[2]);
            a = parts.length === 4 ? parseInt(parts[3]) : 1;
        }
        this.setRGB(r, g, b);
        this._a = a;
    }
});

L.rgbColor = function(colorDef) {
    return new L.RGBColor(colorDef);
};

L.ImageFilter = L.Class.extend({
    initialize: function(image, options) {
        this._image = image;
        L.Util.setOptions(this, options);
    },
    render: function() {
        return this;
    }
});

L.CanvasFilter = L.ImageFilter.extend({
    render: function() {
        var canvas;
        if (!this._image.canvasContext) {
            canvas = document.createElement("canvas");
            canvas.width = canvas.height = this._image._layer.options.tileSize;
            this._image.canvasContext = canvas.getContext("2d");
        }
        var ctx = this._image.canvasContext;
        if (ctx) {
            var filter = this.options.channelFilter || function(imageData) {
                return imageData;
            };
            ctx.drawImage(this._image, 0, 0);
            var imgd = ctx.getImageData(0, 0, this._image._layer.options.tileSize, this._image._layer.options.tileSize);
            imgd = filter.call(this._image, imgd);
            ctx.putImageData(imgd, 0, 0);
            this._image.onload = null;
            this._image.removeAttribute("crossorigin");
            if (this._image._layer.options.canvasFilter) {
                this._image._layer.options.canvasFilter.call(this);
            } else {
                this._image.src = canvas.toDataURL();
            }
        }
        return this;
    }
});

L.CanvasChannelFilter = L.Class.extend({
    options: {
        opacity: 255
    },
    initialize: function(imageData, options) {
        this._imageData = imageData;
        L.Util.setOptions(this, options);
    },
    setOpacity: function(opacity) {
        this.options.opacity = opacity;
    },
    updateChannels: function(channels) {
        channels[3] = this.options.opacity;
        return channels;
    },
    render: function() {
        var pixels = this._imageData.data;
        for (var i = 0, n = pixels.length; i < n; i += 4) {
            var channels = this.updateChannels([ pixels[i], pixels[i + 1], pixels[i + 2], pixels[i + 3] ]);
            for (var j = 0; j < 4; ++j) {
                pixels[i + j] = channels[j];
            }
        }
        return this._imageData;
    }
});

L.CanvasChannelFilters = {};

L.CanvasChannelFilters.Grayscale = L.CanvasChannelFilter.extend({
    options: {
        channelWeights: [ 3, 4, 1 ]
    },
    initialize: function(imageData, options) {
        L.CanvasChannelFilter.prototype.initialize.call(this, imageData, options);
        this.sumWeights();
    },
    sumWeights: function() {
        var sum = 0;
        for (var i = 0; i < 3; ++i) {
            sum += this.options.channelWeights[i];
        }
        this._summedWeight = sum;
    },
    updateChannels: function(channels) {
        channels = L.CanvasChannelFilter.prototype.updateChannels.call(this, channels);
        var channelWeights = this.options.channelWeights;
        channels[0] = channels[1] = channels[2] = (channelWeights[0] * channels[0] + channelWeights[1] * channels[1] + channelWeights[2] * channels[2]) / this._summedWeight;
        return channels;
    }
});

L.CanvasChannelFilters.Threshold = L.CanvasChannelFilters.Grayscale.extend({
    options: {
        channelWeights: [ 3, 4, 1 ],
        thresholds: [ 128, 128, 128, 128 ],
        trueValues: [ 255, 255, 255, 255 ],
        falseValues: [ 0, 0, 0, 255 ]
    },
    initialize: function(imageData, options) {
        L.CanvasChannelFilters.Grayscale.prototype.initialize.call(this, imageData, options);
    },
    updateChannels: function(channels) {
        channels = L.CanvasChannelFilters.Grayscale.prototype.updateChannels.call(this, channels);
        for (var i = 0; i < 4; ++i) {
            channels[i] = channels[i] >= this.options.thresholds[i] ? this.options.trueValues[i] : this.options.falseValues[i];
        }
        return channels;
    }
});

L.CanvasChannelFilters.Contrast = L.CanvasChannelFilter.extend({
    options: {
        contrast: 0,
        factor: function(contrast) {
            return 255 * (255 + contrast) / (255 * (255 - contrast));
        }
    },
    initialize: function(imageData, options) {
        L.CanvasChannelFilter.prototype.initialize.call(this, imageData, options);
        this._factor = this.options.factor.call(this, this.options.contrast);
    },
    updateChannels: function(channels) {
        channels = L.CanvasChannelFilter.prototype.updateChannels.call(this, channels);
        for (var i = 0; i < 3; ++i) {
            channels[i] = this._factor * (channels[i] - 128) + 128;
        }
        return channels;
    }
});

L.CanvasChannelFilters.Invert = L.CanvasChannelFilter.extend({
    updateChannels: function(channels) {
        L.CanvasChannelFilter.prototype.updateChannels.call(this, channels);
        for (var i = 0; i < 3; ++i) {
            channels[i] = 255 - channels[i];
        }
        return channels;
    }
});

L.CanvasChannelFilters.ChannelSwap = L.CanvasChannelFilter.extend({
    options: {
        positions: [ 0, 1 ]
    },
    updateChannels: function(channels) {
        channels = L.CanvasChannelFilter.prototype.updateChannels.call(this, channels);
        var tmp = channels[this.options.positions[0]];
        channels[this.options.positions[0]] = channels[this.options.positions[1]];
        channels[this.options.positions[1]] = tmp;
        return channels;
    }
});

L.CanvasChannelFilters.Matrix = L.CanvasChannelFilter.extend({
    options: {
        matrix: [ .393, .769, .189, .349, .686, .168, .272, .534, .131 ]
    },
    updateChannels: function(channels) {
        channels = L.CanvasChannelFilter.prototype.updateChannels.call(this, channels);
        var matrix = this.options.matrix;
        var r = channels[0];
        var g = channels[1];
        var b = channels[2];
        for (var i = 0; i < 3; ++i) {
            channels[i] = r * matrix[3 * i] + g * matrix[3 * i + 1] + b * matrix[3 * i + 2];
        }
        return channels;
    }
});

L.CanvasChannelFilters.Sepia = L.CanvasChannelFilters.Matrix.extend({
    options: {
        matrix: [ .393, .769, .189, .349, .686, .168, .272, .534, .131 ]
    }
});

L.CanvasChannelFilters.FilterChain = L.CanvasChannelFilter.extend({
    options: {
        filters: []
    },
    setFilters: function(filters) {
        this.options.filters = filters;
        return this;
    },
    clearFilters: function() {
        this.options.filters = [];
        return this;
    },
    updateChannels: function(channels) {
        channels = L.CanvasChannelFilter.prototype.updateChannels.call(this, channels);
        var filters = this.options.filters;
        for (var i = 0; i < filters.length; ++i) {
            channels = filters[i].call(this, channels);
        }
        return channels;
    }
});

L.CanvasChannelFilters.Adjust = L.CanvasChannelFilter.extend({
    options: {
        adjustments: [ 20, 20, 20 ]
    },
    updateChannels: function(channels) {
        channels = L.CanvasChannelFilter.prototype.updateChannels.call(this, channels);
        for (var i = 0; i < 3; ++i) {
            channels[i] = Math.min(Math.max(channels[i] + this.options.adjustments[i], 0), 255);
        }
        return channels;
    }
});

L.CanvasChannelFilters.HSLAdjust = L.CanvasChannelFilter.extend({
    options: {
        adjustments: [ 30, 0, 0 ]
    },
    updateChannels: function(channels) {
        channels = L.CanvasChannelFilter.prototype.updateChannels.call(this, channels);
        var color = new L.RGBColor([ channels[0], channels[1], channels[2], channels[3] ]);
        color.setHSL((color._hsl[0] * 360 + this.options.adjustments[0]) / 360, color._hsl[1] + this.options.adjustments[1], color._hsl[2] + this.options.adjustments[2]);
        for (var i = 0; i < 3; ++i) {
            channels[i] = color._rgb[i];
        }
        if (this.options.adjustments.length > 3) {
            channels[3] += this.options.adjustments[3];
        }
        color = null;
        return channels;
    }
});

L.CanvasChannelFilters.Colorize = L.CanvasChannelFilter.extend({
    options: {
        channel: 0,
        values: [ 0, 0 ]
    },
    updateChannels: function(channels) {
        channels = L.CanvasChannelFilter.prototype.updateChannels.call(this, channels);
        var channelIndices = [ 0, 1, 2 ];
        channelIndices.splice(this.options.channel, 1);
        var r = channels[0];
        var g = channels[1];
        var b = channels[2];
        channels[this.options.channel] = (r + g + b) / 3;
        channels[channelIndices[0]] = this.options.values[0];
        channels[channelIndices[1]] = this.options.values[1];
        return channels;
    }
});

L.CSSFilter = L.ImageFilter.extend({
    statics: {
        prefixes: [ "-webkit-", "-moz-", "-ms-", "-o-", "" ]
    },
    render: function() {
        for (var i = 0; i < L.CSSFilter.prefixes.length; ++i) {
            this._image.style.cssText += " " + L.CSSFilter.prefixes[i] + "filter: " + this.options.filters.join(" ") + ";";
        }
    }
});

L.CombinedFilter = L.ImageFilter.extend({
    setCanvasFilter: function(filter) {
        this.options.channelFilter = filter;
        return this.render();
    },
    setCSSFilter: function(filter) {
        this.options.cssFilter = filter;
        return this.render();
    },
    render: function() {
        var image = L.CanvasFilter.prototype.render.call(this);
        if (this.options.cssFilter) {
            this.options.cssFilter.call(image._image);
        }
    }
});

L.ImageFilters = {};

L.ImageFilters.GenerateCSSFilter = function(filters) {
    return function() {
        return new L.CSSFilter(this, {
            filters: filters
        }).render();
    };
};

L.ImageFilters.Presets = {
    CSS: {
        None: function() {
            return this;
        },
        Brightness200: L.ImageFilters.GenerateCSSFilter([ "brightness(200%)" ]),
        Brightness180: L.ImageFilters.GenerateCSSFilter([ "brightness(180%)" ]),
        Brightness160: L.ImageFilters.GenerateCSSFilter([ "brightness(160%)" ]),
        Brightness140: L.ImageFilters.GenerateCSSFilter([ "brightness(140%)" ]),
        Brightness120: L.ImageFilters.GenerateCSSFilter([ "brightness(120%)" ]),
        Brightness100: L.ImageFilters.GenerateCSSFilter([ "brightness(100%)" ]),
        Brightness80: L.ImageFilters.GenerateCSSFilter([ "brightness(80%)" ]),
        Brightness60: L.ImageFilters.GenerateCSSFilter([ "brightness(60%)" ]),
        Brightness40: L.ImageFilters.GenerateCSSFilter([ "brightness(40%)" ]),
        Brightness20: L.ImageFilters.GenerateCSSFilter([ "brightness(20%)" ]),
        Contrast200: L.ImageFilters.GenerateCSSFilter([ "contrast(200%)" ]),
        Contrast180: L.ImageFilters.GenerateCSSFilter([ "contrast(180%)" ]),
        Contrast160: L.ImageFilters.GenerateCSSFilter([ "contrast(160%)" ]),
        Contrast140: L.ImageFilters.GenerateCSSFilter([ "contrast(140%)" ]),
        Contrast120: L.ImageFilters.GenerateCSSFilter([ "contrast(120%)" ]),
        Contrast100: L.ImageFilters.GenerateCSSFilter([ "contrast(100%)" ]),
        Contrast80: L.ImageFilters.GenerateCSSFilter([ "contrast(80%)" ]),
        Contrast60: L.ImageFilters.GenerateCSSFilter([ "contrast(60%)" ]),
        Contrast40: L.ImageFilters.GenerateCSSFilter([ "contrast(40%)" ]),
        Contrast20: L.ImageFilters.GenerateCSSFilter([ "contrast(20%)" ]),
        Sepia100: L.ImageFilters.GenerateCSSFilter([ "sepia(100%)" ]),
        Sepia80: L.ImageFilters.GenerateCSSFilter([ "sepia(80%)" ]),
        Sepia60: L.ImageFilters.GenerateCSSFilter([ "sepia(60%)" ]),
        Sepia40: L.ImageFilters.GenerateCSSFilter([ "sepia(40%)" ]),
        Sepia20: L.ImageFilters.GenerateCSSFilter([ "sepia(20%)" ]),
        Saturate200: L.ImageFilters.GenerateCSSFilter([ "saturate(200%)" ]),
        Saturate300: L.ImageFilters.GenerateCSSFilter([ "saturate(300%)" ]),
        Saturate400: L.ImageFilters.GenerateCSSFilter([ "saturate(400%)" ]),
        Saturate500: L.ImageFilters.GenerateCSSFilter([ "saturate(500%)" ]),
        Saturate600: L.ImageFilters.GenerateCSSFilter([ "saturate(600%)" ]),
        Saturate700: L.ImageFilters.GenerateCSSFilter([ "saturate(700%)" ]),
        Invert100: L.ImageFilters.GenerateCSSFilter([ "invert(100%)" ]),
        Invert80: L.ImageFilters.GenerateCSSFilter([ "invert(80%)" ]),
        Invert60: L.ImageFilters.GenerateCSSFilter([ "invert(60%)" ]),
        Invert40: L.ImageFilters.GenerateCSSFilter([ "invert(40%)" ]),
        Invert20: L.ImageFilters.GenerateCSSFilter([ "invert(20%)" ]),
        HueRotate30: L.ImageFilters.GenerateCSSFilter([ "hue-rotate(30deg)" ]),
        HueRotate60: L.ImageFilters.GenerateCSSFilter([ "hue-rotate(60deg)" ]),
        HueRotate90: L.ImageFilters.GenerateCSSFilter([ "hue-rotate(90deg)" ]),
        HueRotate120: L.ImageFilters.GenerateCSSFilter([ "hue-rotate(120deg)" ]),
        HueRotate150: L.ImageFilters.GenerateCSSFilter([ "hue-rotate(150deg)" ]),
        HueRotate180: L.ImageFilters.GenerateCSSFilter([ "hue-rotate(180deg)" ]),
        HueRotate210: L.ImageFilters.GenerateCSSFilter([ "hue-rotate(210deg)" ]),
        HueRotate240: L.ImageFilters.GenerateCSSFilter([ "hue-rotate(240deg)" ]),
        HueRotate270: L.ImageFilters.GenerateCSSFilter([ "hue-rotate(270deg)" ]),
        HueRotate300: L.ImageFilters.GenerateCSSFilter([ "hue-rotate(300deg)" ]),
        HueRotate330: L.ImageFilters.GenerateCSSFilter([ "hue-rotate(330deg)" ])
    },
    CanvasChannel: {
        None: function(imageData) {
            return imageData;
        },
        Grayscale1: function(imageData) {
            return new L.CanvasChannelFilters.Grayscale(imageData).render();
        },
        Grayscale2: function(imageData) {
            return new L.CanvasChannelFilters.Grayscale(imageData, {
                weights: [ 1, 1, 1 ]
            }).render();
        },
        Grayscale3: function(imageData) {
            return new L.CanvasChannelFilters.Grayscale(imageData, {
                weights: [ 1, 2, 3 ]
            }).render();
        },
        HueRotate30: function(imageData) {
            return new L.CanvasChannelFilters.HSLAdjust(imageData, {
                adjustments: [ 30, 0, 0 ]
            }).render();
        },
        HueRotate60: function(imageData) {
            return new L.CanvasChannelFilters.HSLAdjust(imageData, {
                adjustments: [ 60, 0, 0 ]
            }).render();
        },
        HueRotate90: function(imageData) {
            return new L.CanvasChannelFilters.HSLAdjust(imageData, {
                adjustments: [ 90, 0, 0 ]
            }).render();
        },
        HueRotate120: function(imageData) {
            return new L.CanvasChannelFilters.HSLAdjust(imageData, {
                adjustments: [ 120, 0, 0 ]
            }).render();
        },
        HueRotate150: function(imageData) {
            return new L.CanvasChannelFilters.HSLAdjust(imageData, {
                adjustments: [ 150, 0, 0 ]
            }).render();
        },
        HueRotate180: function(imageData) {
            return new L.CanvasChannelFilters.HSLAdjust(imageData, {
                adjustments: [ 180, 0, 0 ]
            }).render();
        },
        HueRotate210: function(imageData) {
            return new L.CanvasChannelFilters.HSLAdjust(imageData, {
                adjustments: [ 210, 0, 0 ]
            }).render();
        },
        HueRotate240: function(imageData) {
            return new L.CanvasChannelFilters.HSLAdjust(imageData, {
                adjustments: [ 240, 0, 0 ]
            }).render();
        },
        HueRotate270: function(imageData) {
            return new L.CanvasChannelFilters.HSLAdjust(imageData, {
                adjustments: [ 270, 0, 0 ]
            }).render();
        },
        HueRotate300: function(imageData) {
            return new L.CanvasChannelFilters.HSLAdjust(imageData, {
                adjustments: [ 300, 0, 0 ]
            }).render();
        },
        HueRotate330: function(imageData) {
            return new L.CanvasChannelFilters.HSLAdjust(imageData, {
                adjustments: [ 330, 0, 0 ]
            }).render();
        },
        Sepia1: function(imageData) {
            return new L.CanvasChannelFilters.Sepia(imageData).render();
        },
        Invert: function(imageData) {
            return new L.CanvasChannelFilters.Invert(imageData).render();
        },
        ColorizeRed: function(imageData) {
            return new L.CanvasChannelFilters.Colorize(imageData, {
                channel: 0,
                values: [ 0, 0 ]
            }).render();
        },
        ColorizeGreen: function(imageData) {
            return new L.CanvasChannelFilters.Colorize(imageData, {
                channel: 1,
                values: [ 0, 0 ]
            }).render();
        },
        ColorizeBlue: function(imageData) {
            return new L.CanvasChannelFilters.Colorize(imageData, {
                channel: 2,
                values: [ 0, 0 ]
            }).render();
        }
    }
};

L.ImageFilterFunctions = {
    __loadTile: L.TileLayer.prototype._loadTile,
    __tileOnLoad: L.TileLayer.prototype._tileOnLoad,
    setFilter: function(filter) {
        this.options.filter = filter;
        return this.redraw();
    },
    clearFilter: function() {
        this.options.filter = null;
        return this.redraw();
    },
    _tileOnLoad: function() {
        var filter = this._layer.options.filter;
        if (filter) {
            filter.call(this);
        }
        this._layer.__tileOnLoad.call(this);
    },
    _loadTile: function(tile, tilePoint) {
        tile.setAttribute("crossorigin", "anonymous");
        this.__loadTile.call(this, tile, tilePoint);
    }
};

L.TileLayer.include(L.ImageFilterFunctions);