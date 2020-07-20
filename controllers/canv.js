const Canvas = require("canvas");
const Mustache = require("mustache");

// Emoji Support
Canvas.registerFont("./assets/fonts/OpenMoji-Black.ttf", {family: "OpenMoji", weight: "normal", style: "normal"});
Canvas.registerFont("./assets/fonts/NotoEmoji-Regular.ttf", {family: "Noto Emoji", weight: "normal", style: "normal"});

// Language Support (Devanagari, Bengali, Tamil, Gujarati and Telugu)
Canvas.registerFont("./assets/fonts/Hind-Regular.ttf", {family: "Hind", weight: "normal", style: "normal"});
Canvas.registerFont("./assets/fonts/Hind-Bold.ttf", {family: "Hind", weight: "bold", style: "normal"});
Canvas.registerFont("./assets/fonts/Hind-Light.ttf", {family: "Hind", weight: "light", style: "normal"});
Canvas.registerFont("./assets/fonts/HindGuntur-Regular.ttf", {family: "Hind Guntur", weight: "normal", style: "normal"});
Canvas.registerFont("./assets/fonts/HindGuntur-Bold.ttf", {family: "Hind Guntur", weight: "bold", style: "normal"});
Canvas.registerFont("./assets/fonts/HindGuntur-Light.ttf", {family: "Hind Guntur", weight: "light", style: "normal"});
Canvas.registerFont("./assets/fonts/HindMadurai-Regular.ttf", {family: "Hind Madurai", weight: "normal", style: "normal"});
Canvas.registerFont("./assets/fonts/HindMadurai-Bold.ttf", {family: "Hind Madurai", weight: "bold", style: "normal"});
Canvas.registerFont("./assets/fonts/HindMadurai-Light.ttf", {family: "Hind Madurai", weight: "light", style: "normal"});
Canvas.registerFont("./assets/fonts/HindSiliguri-Regular.ttf", {family: "Hind Siliguri", weight: "normal", style: "normal"});
Canvas.registerFont("./assets/fonts/HindSiliguri-Bold.ttf", {family: "Hind Siliguri", weight: "bold", style: "normal"});
Canvas.registerFont("./assets/fonts/HindSiliguri-Light.ttf", {family: "Hind Siliguri", weight: "light", style: "normal"});
Canvas.registerFont("./assets/fonts/HindVadodara-Regular.ttf", {family: "Hind Vadodara", weight: "normal", style: "normal"});
Canvas.registerFont("./assets/fonts/HindVadodara-Bold.ttf", {family: "Hind Vadodara", weight: "bold", style: "normal"});
Canvas.registerFont("./assets/fonts/HindVadodara-Light.ttf", {family: "Hind Vadodara", weight: "light", style: "normal"});

// Language Support (Burmese and Thai)
Canvas.registerFont("./assets/fonts/Kanit-Regular.ttf", {family: "Kanit", weight: "normal", style: "normal"});
Canvas.registerFont("./assets/fonts/Kanit-Italic.ttf", {family: "Kanit", weight: "normal", style: "italic"});
Canvas.registerFont("./assets/fonts/Kanit-Bold.ttf", {family: "Kanit", weight: "bold", style: "normal"});
Canvas.registerFont("./assets/fonts/Kanit-BoldItalic.ttf", {family: "Kanit", weight: "bold", style: "italic"});
Canvas.registerFont("./assets/fonts/Kanit-Light.ttf", {family: "Kanit", weight: "light", style: "normal"});
Canvas.registerFont("./assets/fonts/Kanit-LightItalic.ttf", {family: "Kanit", weight: "light", style: "italic"});
Canvas.registerFont("./assets/fonts/Padauk-Regular.ttf", {family: "Padauk", weight: "normal", style: "normal"});
Canvas.registerFont("./assets/fonts/Padauk-Bold.ttf", {family: "Padauk", weight: "bold", style: "normal"});

// Language Support (Japanese, Korean and Chinese)
Canvas.registerFont("./assets/fonts/NotoSansJP-Regular.otf", {family: "Noto Sans JP", weight: "normal", style: "normal"});
Canvas.registerFont("./assets/fonts/NotoSansJP-Bold.otf", {family: "Noto Sans JP", weight: "bold", style: "normal"});
Canvas.registerFont("./assets/fonts/NotoSansJP-Light.otf", {family: "Noto Sans JP", weight: "light", style: "normal"});
Canvas.registerFont("./assets/fonts/NotoSansKR-Regular.otf", {family: "Noto Sans KR", weight: "normal", style: "normal"});
Canvas.registerFont("./assets/fonts/NotoSansKR-Bold.otf", {family: "Noto Sans KR", weight: "bold", style: "normal"});
Canvas.registerFont("./assets/fonts/NotoSansKR-Light.otf", {family: "Noto Sans KR", weight: "light", style: "normal"});
Canvas.registerFont("./assets/fonts/NotoSansTC-Regular.otf", {family: "Noto Sans TC", weight: "normal", style: "normal"});
Canvas.registerFont("./assets/fonts/NotoSansTC-Bold.otf", {family: "Noto Sans TC", weight: "bold", style: "normal"});
Canvas.registerFont("./assets/fonts/NotoSansTC-Light.otf", {family: "Noto Sans TC", weight: "light", style: "normal"});
Canvas.registerFont("./assets/fonts/NotoSansSC-Regular.otf", {family: "Noto Sans SC", weight: "normal", style: "normal"});
Canvas.registerFont("./assets/fonts/NotoSansSC-Bold.otf", {family: "Noto Sans SC", weight: "bold", style: "normal"});
Canvas.registerFont("./assets/fonts/NotoSansSC-Light.otf", {family: "Noto Sans SC", weight: "light", style: "normal"});
Canvas.registerFont("./assets/fonts/NotoSansHK-Regular.otf", {family: "Noto Sans HK", weight: "normal", style: "normal"});
Canvas.registerFont("./assets/fonts/NotoSansHK-Bold.otf", {family: "Noto Sans HK", weight: "bold", style: "normal"});
Canvas.registerFont("./assets/fonts/NotoSansHK-Light.otf", {family: "Noto Sans HK", weight: "light", style: "normal"});

// Main Fonts
Canvas.registerFont("./assets/fonts/whitney-medium.otf", {family: "Whitney", weight: "normal", style: "normal"});
Canvas.registerFont("./assets/fonts/whitney-mediumitalic.otf", {family: "Whitney", weight: "normal", style: "italic"});
Canvas.registerFont("./assets/fonts/whitney-boldsc.otf", {family: "Whitney", weight: "bold", style: "normal"});
Canvas.registerFont("./assets/fonts/whitney-bolditalicsc.otf", {family: "Whitney", weight: "bold", style: "italic"});
Canvas.registerFont("./assets/fonts/whitney-light.otf", {family: "Whitney", weight: "light", style: "normal"});
Canvas.registerFont("./assets/fonts/whitney-lightitalic.otf", {family: "Whitney", weight: "light", style: "italic"});
Canvas.registerFont("./assets/fonts/PTSans-Regular.ttf", {family: "PT Sans", weight: "normal", style: "normal"});
Canvas.registerFont("./assets/fonts/PTSans-Italic.ttf", {family: "PT Sans", weight: "normal", style: "italic"});
Canvas.registerFont("./assets/fonts/PTSans-Bold.ttf", {family: "PT Sans", weight: "bold", style: "normal"});
Canvas.registerFont("./assets/fonts/PTSans-BoldItalic.ttf", {family: "PT Sans", weight: "bold", style: "italic"});

const fonts = "PT Sans, Noto Emoji, Whitney, Noto Sans JP, Noto Sans KR, Noto Sans TC, Noto Sans SC, Noto Sans HK";
const backgrounds = ["Base", "Purple Checker", "B&W Spiral", "Waterfall", "Country Hill", "Stars", "Bamboo Forest", "Dandelion", "Snowy Mountains", "Campfire By A Lake"];
const styles = [
    {
        id: "default",
        data: {
            font: `9px ${fonts}`,
            textAlign: "left",
            textBaseline: "top",
            fillStyle: "#000",
            strokeStyle: "#000"
        }
    },
    {
        id: "level",
        data: {
            font: `20px ${fonts}`,
            textAlign: "center"
        }
    },
    {
        id: "h1",
        data: {
            font: `bold 16px ${fonts}`
        }
    },
    {
        id: "h2",
        data: {
            font: `14px ${fonts}`
        }
    },
    {
        id: "h3",
        data: {
            font: `12px ${fonts}`
        }
    },
    {
        id: "h4",
        data: {
            font: `bold 10px ${fonts}`
        }
    },
    {
        id: "center",
        data: {
            textAlign: "center"
        }
    },
    {
        id: "h3-center",
        data: {
            font: `12px ${fonts}`,
            textAlign: "center"
        }
    },
    {
        id: "h1-center",
        data: {
            font: `bold 16px ${fonts}`,
            textAlign: "center"
        }
    },
];

const bkstyles = [
    {
        id: "default",
        data: {
            font: "9px \"PT Sans\"",
            textAlign: "left",
            textBaseline: "top",
            fillStyle: "#000",
            strokeStyle: "#000"
        }
    },
    {
        id: "h1",
        data: {
            font: "bold 16px \"PT Sans\""
        }
    },
    {
        id: "h2",
        data: {
            font: "14px \"PT Sans\""
        }
    },
    {
        id: "h3",
        data: {
            font: "12px \"PT Sans\""
        }
    },
    {
        id: "h4",
        data: {
            font: "bold 10px \"PT Sans\""
        }
    },
    {
        id: "center",
        data: {
            textAlign: "center"
        }
    }
];

class Template {
    constructor(templateDir, width = 300, height = 300) {
        this._backgrounds = new Map();
        this._bkgAvailable = false;
        this._template = null;
        this._steps = [];
        this._styles = new Map();
        this._imgCache = new Map();
        this._width = width;
        this._height = height;

        this.loadTemplate(templateDir);
    }

    addStyles(json) {
        const def = json.find(v => v.id === "default");
        if(!def) def = {};
        else {
            this._styles.set("default", def.data);
            this.setStyle();
        }

        json.forEach(v => {
            if(v.id !== "default")
                this._styles.set(v.id, {...def.data, ...v.data});
        });
    }

    setStyle(style = "default") {
        const data = this._styles.get(style);
        if(data) {
            Object.keys(data).forEach(v => {
                this._steps.push({type: v, data: data[v]});
            });
        }
    }

    addImage(dir, x = 0, y = 0, width = undefined, height = undefined, fromData = false) {
        this._steps.push({type: fromData ? "dynamicImage" : "image", data: {
            src: dir,
            x, y, width, height
        }});
    }

    addText(str, x = 0, y = 0, optional = {style: null, lnHeight: 5, fontSize: 12}) {
        if(optional && optional.style)
            this.setStyle(optional.style);

        this._steps.push({type: "block", data: {
            string: str,
            x,
            y,
            width: null,
            height: 0,
            optional
        }});
    }

    addTextBlock(str, x = 0, y = 0, width = null, height = null, optional = {style: null, lnHeight: 5, fontSize: 12}) {
        if(optional && optional.style)
            this.setStyle(optional.style);

        this._steps.push({type: "block", data: {
            string: str,
            x,
            y,
            width,
            height,
            optional
        }});
    }

    addStep(fn = {type: null, data: null}) {
        if(typeof fn === "function")
            this._steps.push({type:  "function", data: fn});
        else if(fn && fn.type)
            this._steps.push({type: fn.type, data: fn.data});
    }

    async generate(data = {bkgnd: null}, stream = true) {
        const canvas = Canvas.createCanvas(this._width, this._height);
        const ctx = canvas.getContext("2d");

        if(this._bkgAvailable) ctx.drawImage(data.bkgnd ? this._backgrounds.get(data.bkgnd) : this._backgrounds.values[0], 0, 0);
        ctx.drawImage(this._template, 0, 0);

        for (let i = 0; i < this._steps.length; i++) {
            const v = this._steps[i];
            switch (v.type) {
                case "function":
                    if(v.data.constructor.name === "AsyncFunction") await v.data(ctx, data);
                    else v.data(ctx, data);
                    break;
                case "fillRect":
                    ctx.fillRect(...v.data);
                    break;
                case "block": 
                    Template.txtBlock(ctx, Mustache.render(v.data.string, data), v.data.x, v.data.y, v.data.width, v.data.height, v.data.optional);
                    break;
                case "image":
                    let img = this._imgCache.get(v.data.src);
                    if(!img) {
                        img = await Canvas.loadImage(v.data.src);
                        this._imgCache.set(v.data.src, img);
                    }
                    ctx.drawImage(img, v.data.x, v.data.y, v.data.width, v.data.height);
                    break;
                case "dynamicImage":
                        let dimg = this._imgCache.get(data[v.data.src]);
                        if(!dimg) {
                            dimg = await Canvas.loadImage(data[v.data.src]);
                            this._imgCache.set(data[v.data.src], dimg);
                        }
                        ctx.drawImage(dimg, v.data.x, v.data.y, v.data.width, v.data.height);
                        break;
                default:
                    ctx[v.type] = v.data;
                    break;
            }
        }

        if(stream) return canvas.createPNGStream({compressionLevel: 7});
        else return canvas;
    }

    loadTemplate(dir) {
        const img = new Canvas.Image();
        img.onload = () => this._template = img;
        img.onerror = err => { throw err; };
        img.src = dir;
    }

    loadBackgrounds(path, arr, fileType = "png") {
        this._bkgAvailable = true;
        arr.forEach(v => {
            let imgName, ft = fileType, p = path;
            if(typeof v === "string")
                imgName = v;
            else {
                imgName = v.name;
                ft = v.type ? v.type : ft;
                p = v.path ? v.path : p;
            }

            const img = new Canvas.Image();
            img.onload = () => this._backgrounds.set(v, img);
            img.onerror = err => { throw err; };
            img.src = `${p}/${imgName}.${ft}`;
        });
    }

    static getWord(ctx, text, maxWidth) {
        let letters = text.split("");
        let word = [];
        let currWord = letters[0];
    
        for (let i = 1; i < letters.length-1; i++) {
            let letter = letters[i];
            let width = ctx.measureText(currWord + letter + "-").width;
            if (width < maxWidth) {
                currWord += letter;
            } else {
                word.push(currWord+"-");
                currWord = letter;
            }
        }
        word.push(currWord+letters[letters.length-1]);
        return word;
    }

    static getLines(ctx, text, maxWidth) {
        let words = text.split(" ");
        let lines = [];
        let currentLine = words[0];
    
        let wordsep = Template.getWord(ctx, currentLine, maxWidth);
        if(wordsep.length > 1) {
            let last = wordsep.pop();
            lines = lines.concat(wordsep);
            currentLine = last;
        }
    
        for (let i = 1; i < words.length; i++) {
            let word = words[i];
    
            wordsep = Template.getWord(ctx, word, maxWidth);
            if(wordsep.length > 1) {
                let last = wordsep.pop();
                let penultimum = wordsep.pop();
                lines.push(currentLine);
                if(wordsep.length > 1)lines = lines.concat(wordsep);
                currentLine = penultimum;
                word = last;
            }
    
            let width = ctx.measureText(currentLine + " " + word).width;
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
    
        lines.push(currentLine);
        return lines;
    }

    static getLinesForParagraphs(ctx, text, maxWidth) {
        return text.split("\n").map(para => Template.getLines(ctx, para, maxWidth)).reduce((a, b) => a.concat(b));
    }

    static txtBlock(ctx, str, x1, y1, maxw, maxh = 0, options = {lnHeight: 5, fontSize: 12}) {
        // eslint-disable-next-line eqeqeq
        if(str === "" || str == undefined) return;
    
        if(maxw != null) {
            let lines = Template.getLinesForParagraphs(ctx, str, maxw),
                currentHeight = 0;
                
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                currentHeight += options.fontSize;
                if(i > 0 && currentHeight > maxh)
                    return;
                else
                    ctx.fillText(line, x1, y1);
    
                currentHeight = options.lnHeight + currentHeight;
                y1 = y1 + options.fontSize + options.lnHeight;
            }
        }
        else ctx.fillText(str, x1, y1);
    }
}

// const ProfileTemp = new Template("./assets/imgs/templates/profile.png");
// ProfileTemp.loadBackgrounds("./assets/imgs/backgrounds/profile", ["Purple Checker", "Base", "B&W Spiral", "Road Light Painting", "Waterfall", "Country Hill", "Stars", "Bamboo Forest", "Dandelion", "Snowy Mountains", "Campfire By A Lake"]);
// ProfileTemp.addStyles(oldStyle);
// ProfileTemp.addImage("aurl", 25, 25, 75, 75, true);
// ProfileTemp.addTextBlock("{{uname}}", 110, 30, 165, null, {style: "titleText", fontSize: 19, lnHeight: 5});
// ProfileTemp.addText("{{profile.currency}}", 43, 106, {style: "medText"});
// ProfileTemp.addText("{{profile.reputation}}", 43, 136);
// ProfileTemp.addTextBlock("Level: {{leveling.global.level}}", 120, 115, 75, 20, {lnHeight: 3, fontSize: 14});
// ProfileTemp.setStyle();
// ProfileTemp.addTextBlock("{{profile.description}}", 30.5, 200, 239.5, 70, {lnHeight: 3, fontSize: 12});
// ProfileTemp.addTextBlock("{{profile.nickname}}", 110, 75, 155, null, {style: "subtitleText"});
// ProfileTemp.addStep({type: "fillStyle", data: "rgb(0, 106, 194)"});
// ProfileTemp.addStep((ctx, data) => {ctx.fillRect(120, 140, 1.45*data.leveling.global.reqs.percentage, 15);});
// ProfileTemp.addTextBlock("{{level.percentage}}% ({{level.currExp}}/{{level.req}})", 192.5, 140, 145, 15, {style: "tinyText", lnHeight: 3, fontSize: 9});

const ProfileTemp = new Template("./assets/imgs/templates/profile2.png");
ProfileTemp.loadBackgrounds("./assets/imgs/backgrounds/profile", backgrounds);
ProfileTemp.addStyles(styles);
ProfileTemp.addImage("aurl", 25, 45, 75, 75, true);
ProfileTemp.addTextBlock("{{uname}}", 110, 90, 165, null, {style: "h1", fontSize: 16, lnHeight: 5});
ProfileTemp.addText("{{profile.currency}}", 47, 189.4, {style: "h2"});
ProfileTemp.addText("{{profile.reputation}}", 47, 220);
ProfileTemp.addTextBlock("Level: {{leveling.global.level}}", 30, 147, 60, 15, {style: "h3", lnHeight: 3, fontSize: 12});
ProfileTemp.setStyle();
ProfileTemp.addTextBlock("{{profile.description}}", 165, 160, 105, 105, {lnHeight: 3, fontSize: 9});
ProfileTemp.addStep({type: "fillStyle", data: "rgb(0, 106, 194)"});
ProfileTemp.addStep((ctx, data) => {ctx.fillRect(30, 165, 1.05*data.leveling.global.reqs.percentage, 12);});
ProfileTemp.addTextBlock("{{level.percentage}}% ({{level.currExp}}/{{level.req}})", 82.5, 164, 105, 10, {style: "center", lnHeight: 3, fontSize: 9});


const LevelGuildTemp = new Template("./assets/imgs/templates/level-guild.png", 300, 120);
LevelGuildTemp.loadBackgrounds("./assets/imgs/backgrounds/level", backgrounds);
LevelGuildTemp.addStyles(styles);
LevelGuildTemp.addImage("gurl", 160, 40, 35, 35, true);
LevelGuildTemp.addTextBlock("{{gname}}", 160, 22.4, 80, null, {style: "h4", fontSize: 10, lnHeight: 5});
LevelGuildTemp.addStep({type: "fillStyle", data: "rgb(0, 106, 194)"});
LevelGuildTemp.addStep((ctx, data) => {ctx.fillRect(20, 80, 1.3*data.global.percentageFull, 20);});
LevelGuildTemp.addStep((ctx, data) => {ctx.fillRect(155, 80, 1.3*data.guild.percentageFull, 20);});
LevelGuildTemp.addTextBlock("{{global.level}}", 125, 47.1, 35, null, {style: "level", fontSize: 20, lnHeight: 5});
LevelGuildTemp.addTextBlock("{{guild.level}}", 260, 47.1, 35, null, {fontSize: 20, lnHeight: 5});
LevelGuildTemp.addTextBlock("{{global.percentage}}% ({{global.currExp}}/{{global.req}})", 85, 81, 130, 18, {style: "h3-center", lnHeight: 3, fontSize: 12});
LevelGuildTemp.addTextBlock("{{guild.percentage}}% ({{guild.currExp}}/{{guild.req}})", 220, 81, 130, 18, {lnHeight: 3, fontSize: 12});

const LevelGlobalTemp = new Template("./assets/imgs/templates/level-global.png", 300, 120);
LevelGlobalTemp.loadBackgrounds("./assets/imgs/backgrounds/level", backgrounds);
LevelGlobalTemp.addStyles(styles);
LevelGlobalTemp.addStep({type: "fillStyle", data: "rgb(0, 106, 194)"});
LevelGlobalTemp.addStep((ctx, data) => {ctx.fillRect(20, 80, 1.3*data.global.percentageFull, 20);});
LevelGlobalTemp.addTextBlock("{{global.level}}", 125, 47.1, 35, null, {style: "level", fontSize: 20, lnHeight: 5});
LevelGlobalTemp.addTextBlock("{{global.percentage}}% ({{global.currExp}}/{{global.req}})", 85, 81, 130, 18, {style: "h3-center", lnHeight: 3, fontSize: 12});

// const LevelUpTemp = new Template("./assets/imgs/templates/old_level-up.png", 75, 100);
// LevelUpTemp.addStyles(styles);
// LevelUpTemp.addImage("aurl", 12.5, 10, 50, 50, true);
// LevelUpTemp.addTextBlock("{{level}}", 37.5, 70, 50, null, {style: "level", fontSize: 20, lnHeight: 5});

const LevelUpTemp = new Template("./assets/imgs/templates/level-up.png", 300, 100);
LevelUpTemp.loadBackgrounds("./assets/imgs/backgrounds/level-up", backgrounds);
LevelUpTemp.addStyles(styles);
LevelUpTemp.addImage("aurl", 10, 10, 80, 80, true);
LevelUpTemp.addTextBlock("{{uname}}", 147.5, 27.3, 105, null, {style: "h1-center", fontSize: 16, lnHeight: 5});
LevelUpTemp.addTextBlock("{{level}}", 147.5, 60, 50, null, {style: "level", fontSize: 20, lnHeight: 5});
LevelUpTemp.addImage("./assets/imgs/etc/LevelUpBar.png", 85, 7, 125, 20);

module.exports = {
    Canvas,
    ProfileTemp,
    LevelGuildTemp,
    LevelGlobalTemp,
    LevelUpTemp
};