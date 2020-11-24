const {MessageEmbed} = require("discord.js");
const {EVENTS} = require("./constants");

/**
 * Log data.
 * @typedef {Object} LogData
 * @param {string} description - Event log description.
 * @param {Object} fields - Event log fields.
 * @param {string} fields.name - Field name.
 * @param {string} fields.value - Field value.
 */

/**
 * Log an event to Discord.
 * @param {LogEvent} event 
 * @param {LogData} data 
 * @param {*} channel 
 */
async function sendLog(event, data = 
    {description,fields},
    channel) {
    const log = new MessageEmbed();
    log.setTitle(event.NAME);
    log.setDescription(data.description);

    data.fields.forEach(v => {
        log.addField(v.name, v.value);
    });

    log.setColor(event.PRIORITY.COLOR);
    log.setTimestamp(Date.now());
    log.setFooter(`${event.NAME} (${event.ID}) | ${event.PRIORITY.NAME} (${event.PRIORITY.ID})`);

    channel.send(log);
}