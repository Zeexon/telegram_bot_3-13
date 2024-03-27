const { Client } = require('@notionhq/client');
const config = require('config');

const notion = new Client({
    auth: config.get('NOTION_KEY')
});

const dbData = [];
let itemCounter = 0;

async function create(userTag) {
    try {
        const response = await notion.pages.create({
            parent: { database_id: config.get('NOTION_DB_ID') },
            properties: {
                Name: {
                    title: [
                        {
                            text: {
                                content: userTag
                            }
                        }
                    ]
                },
            }
        });
        return response;
    } catch (error) {
        console.error('ERROR CREATING NOTION PAGE:', error.message);
        throw error;
    }
}

async function getData() {
    try {
        const requestDetails = {
            database_id: config.get('NOTION_DB_ID'),
        };


        const response = await notion.databases.query(requestDetails);
        response.results.forEach(page => {
            const properties = page.properties.Name.title;
            properties.forEach(item => {
                const plainText = item.plain_text;
                dbData.push(plainText); 
            });
        });
        
        if (dbData.length > response.results.length) {
            dbData.splice(response.results.length);
        }
        console.log(dbData)

        return response.results;
    } catch (error) {
        console.error('ERROR QUERYING NOTION DB:', error.message);
        throw error;
    }
}



module.exports = {
    create,
    getData,
    dbData,
};
