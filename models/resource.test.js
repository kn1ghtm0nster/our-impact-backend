"use strict";


const db = require("../db.js");
const { NotFoundError } = require("../expressError");
const Resources = require('./resource');

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
} = require("./_setupForTests");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/****************GETALLRESOURCES TESTS*********************/

describe('getAllResources', () => {
    it('works as expected', async () => {
        const res = await Resources.getAllResources()

        expect(res.length).toEqual(30);
    })
})

/****************GETSINGLERESOURCE TESTS*********************/

describe('getSingleResource', () => {
    it('works as expected', async () => {
        const res = await Resources.getSingleResource(29);

        expect(res).toEqual({
            id: expect.any(Number),
            title: "NASA - What is Climate Change?",
            url: expect.any(String),
            type: "Article",
            rating: "PG"
        })
    })

    it('throws NotFoundError for invalid id', async () => {
        try {
            await Resources.getSingleResource(1234);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }

    })
})

/****************GETALLARTICLES TESTS*********************/

describe('getAllArticles', () => {
    it('works as expected', async () => {
        const res = await Resources.getAllArticles();

        expect(res).toEqual([
            {
                id: expect.any(Number),
                title: 'Tornadoes and Climate Change',
                URL: 'https://tinyurl.com/57ymcjpy',
                type: 'Article',
                rating: 'PG'
            },
            {
                id: expect.any(Number),
                title: 'How Climate Change Impacts Water Access',
                URL: 'https://tinyurl.com/bddzdzjb',
                type: 'Article',
                rating: 'PG'
            },
            {
                id: expect.any(Number),
                title: 'Unbalanced: How Climate Change Is Shifting Earth’s Ecosystems',
                URL: 'https://tinyurl.com/hn2c8cfv',
                type: 'Article',
                rating: 'PG'
            },
            {
                id: expect.any(Number),
                title: 'The Influence of Climate Change on Extreme Environmental Events',
                URL: 'https://tinyurl.com/25sudcpe',
                type: 'Article',
                rating: 'PG'
            },
            {
                id: expect.any(Number),
                title: 'Earths Changing Climate',
                URL: 'https://tinyurl.com/2fc5xtbu',
                type: 'Article',
                rating: 'PG-13'
            },
            {
                id: expect.any(Number),
                title: 'Climate Refugees',
                URL: 'https://tinyurl.com/zh2jsxut',
                type: 'Article',
                rating: 'PG-13'
            },
            {
                id: expect.any(Number),
                title: 'NASA Climate Kids - What is Climate Change?',
                URL: 'https://tinyurl.com/7jpmemsx',
                type: 'Article',
                rating: 'PG'
            },
            {
                id: expect.any(Number),
                title: 'United Nations - What Is Climate Change?',
                URL: 'https://tinyurl.com/53jt6wu3',
                type: 'Article',
                rating: 'PG'
            },
            {
                id: expect.any(Number),
                title: 'NASA - What is Climate Change?',
                URL: 'https://tinyurl.com/tfxnszr6',
                type: 'Article',
                rating: 'PG'
            }
        ]
        )
    })
})

/****************GETALLVIDEOS TESTS*********************/

describe('getAllVideos', () => {
    it('works as expected', async () => {
        const res = await Resources.getAllVideos();

        expect(res).toEqual([
            {
                id: expect.any(Number),
                title: 'Video: Global Warming from 1880 to 2021',
                URL: 'https://tinyurl.com/5ycu679m',
                type: 'Video',
                rating: 'PG'
            },
            {
                id: expect.any(Number),
                title: 'I Live in the Eastern US - Does Climate Change Matter to Me?',
                URL: 'https://tinyurl.com/bd2bpb35',
                type: 'Video',
                rating: 'PG'
            },
            {
                id: expect.any(Number),
                title: 'Southern Great Plains & Southwest | Global Weirding',
                URL: 'https://tinyurl.com/yc6yytn5',
                type: 'Video',
                rating: 'PG'
            },
            {
                id: expect.any(Number),
                title: 'Whats the Big Deal With a Few Degrees?',
                URL: 'https://tinyurl.com/2n9dpu8d',
                type: 'Video',
                rating: 'PG'
            },
            {
                id: expect.any(Number),
                title: 'Paris Agreement: Last Week Tonight with John Oliver (HBO)',
                URL: 'https://tinyurl.com/e67r2u4e',
                type: 'Video',
                rating: 'MATURE'
            },
            {
                id: expect.any(Number),
                title: 'Green New Deal: Last Week Tonight with John Oliver (HBO)',
                URL: 'https://tinyurl.com/5n7bc6w5',
                type: 'Video',
                rating: 'MATURE'
            },
            {
                id: expect.any(Number),
                title: 'We WILL Fix Climate Change!',
                URL: 'https://tinyurl.com/2k9aw4wv',
                type: 'Video',
                rating: 'PG-13'
            },
            {
                id: expect.any(Number),
                title: 'Do we Need Nuclear Energy to Stop Climate Change?',
                URL: 'https://tinyurl.com/2n73uk43',
                type: 'Video',
                rating: 'PG-13'
            },
            {
                id: expect.any(Number),
                title: 'Plastic Pollution: How Humans are Turning the World into Plastic',
                URL: 'https://tinyurl.com/3mk6n5be',
                type: 'Video',
                rating: 'PG-13'
            },
            {
                id: expect.any(Number),
                title: 'Can YOU Fix Climate Change?',
                URL: 'https://tinyurl.com/4a73svj4',
                type: 'Video',
                rating: 'PG-13'
            },
            {
                id: expect.any(Number),
                title: 'Global Climate Change - Through the Lens of Changing Glaciers',
                URL: 'https://tinyurl.com/68ajfkat',
                type: 'Video',
                rating: 'PG'
            },
            {
                id: expect.any(Number),
                title: 'Ocean Impacts of Climate Change',
                URL: 'https://tinyurl.com/25jas9vn',
                type: 'Video',
                rating: 'PG'
            },
            {
                id: expect.any(Number),
                title: 'Amazon Deforestation and Climate Change',
                URL: 'https://tinyurl.com/2brx78vz',
                type: 'Video',
                rating: 'PG-13'
            },
            {
                id: expect.any(Number),
                title: 'Climate 101: Cause and Effect',
                URL: 'https://tinyurl.com/p6zshcsc',
                type: 'Video',
                rating: 'PG'
            },
            {
                id: expect.any(Number),
                title: 'Assessing Drought in the United States',
                URL: 'https://tinyurl.com/z23fdjtf',
                type: 'Video',
                rating: 'PG'
            },
            {
                id: expect.any(Number),
                title: 'Is It Too Late To Stop Climate Change? Well, its Complicated.',
                URL: 'https://tinyurl.com/2p8mj7uk',
                type: 'Video',
                rating: 'PG-13'
            }])
    })
})

/****************GETLANDINGPAGES TESTS*********************/

describe('getLandingPages', () => {
    it('works as expected', async () => {
        const res = await Resources.getLandingPages();

        expect(res).toEqual(
            [
                {
                    id: expect.any(Number),
                    title: 'EPA Resources Page',
                    URL: 'https://tinyurl.com/ymepb2bt',
                    type: 'Landing Page',
                    rating: 'PG'
                },
                {
                    id: expect.any(Number),
                    title: 'NASA Climate Change Landing Page',
                    URL: 'https://tinyurl.com/pj2hb5pu',
                    type: 'Landing Page',
                    rating: 'PG'
                },
                {
                    id: expect.any(Number),
                    title: 'NASA Climate Change - For Kids',
                    URL: 'https://tinyurl.com/243axk4h',
                    type: 'Landing Page',
                    rating: 'PG'
                },
                {
                    id: expect.any(Number),
                    title: 'NASA Climate Change - For Teachers',
                    URL: 'https://tinyurl.com/yyam4atk',
                    type: 'Landing Page',
                    rating: 'PG'
                },
                {
                    id: expect.any(Number),
                    title: 'National Geographic - Climate Change',
                    URL: 'https://tinyurl.com/yhub9j9u',
                    type: 'Landing Page',
                    rating: 'PG'
                }
            ]
        )
    })
})

/****************ADDNEWRESOURCE TESTS*********************/

describe('addNewResource', () => {
    it('works as expected', async () => {
        const data = {
            content_title: 'test-title',
            content_url: 'http://google.com',
            content_type: "Article",
            rating: "MATURE"
        }
        const newResource = await Resources.addNewResource(data);

        expect(newResource).toEqual({
            id: expect.any(Number),
            title: 'test-title',
            url: 'http://google.com',
            type: "Article",
            rating: "MATURE"
        })
    })
})

/****************UPDATERESOURCE TESTS*********************/

describe('updateResource', () => {
    it('works as expected', async () => {
        const data = {
            content_title: 'different-title',
            content_url: 'http://youtube.com',
            content_type: "Video",
            rating: "PG"
        }

        const target = await Resources.addNewResource(data);

        const updatedInfo = {
            content_title: 'new-title',
            content_url: 'http://youtube.com',
            content_type: "Video",
            rating: "MATURE"
        }

        const res = await Resources.updateResource(target.id, updatedInfo);

        expect(res).toEqual({
            id: expect.any(Number),
            title: 'new-title',
            url: 'http://youtube.com',
            type: "Video",
            rating: "MATURE"
        })
    })

    it('throws NotFoundError for invalid id', async () => {
        const updatedInfo = {
            content_title: 'new-title',
            content_url: 'http://youtube.com',
            content_type: "Video",
            rating: "MATURE"
        }

        try {
            await Resources.updateResource(1234, updatedInfo);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    })
})

/****************DELETERESOURCE TESTS*********************/

describe('deleteResource', () => {
    it('works as expected', async () => {
        await Resources.deleteResource(1);

        const res = await Resources.getAllResources();

        expect(res.length).toEqual(29);
    })

    it('throws NotFoundError for invalid id', async () => {
        try {
            await Resources.deleteResource(999);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    })

    it('throws NotFoundError if id has already been deleted', async () => {
        await Resources.deleteResource(1);
        try {
            await Resources.deleteResource(1);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    })
})