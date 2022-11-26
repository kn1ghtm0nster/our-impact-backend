const request = require("supertest");

const db = require("../db.js");
const app = require("../app");
const Resources = require("../models/resource");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    u2Token,
    adminToken,
} = require("./_setupForTests");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** GET /resources */

describe("GET /resources", () => {
    test("route works as expected for admins", async () => {
        const res = await request(app)
            .get("/resources")
            .set("authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.resources.length).toEqual(30);
    });

    test("route works as expected for standard users", async () => {
        const res = await request(app)
            .get("/resources")
            .set("authorization", `Bearer ${u2Token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.resources.length).toEqual(30);
    });

    test("route works as expected for anon users", async () => {
        const res = await request(app).get("/resources");

        expect(res.statusCode).toEqual(200);
        expect(res.body.resources.length).toEqual(30);
    });
});

/************************************** POST /resources */

describe("POST /resources", () => {
    test("route works as expected for admins", async () => {
        const newResource = {
            content_title: "test-title2",
            content_url: "http://kbdfans.com",
            content_type: "Article",
            rating: "MATURE",
        };

        const res = await request(app)
            .post("/resources")
            .send(newResource)
            .set("authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual({
            added: {
                id: expect.any(Number),
                title: "test-title2",
                url: "http://kbdfans.com",
                type: "Article",
                rating: "MATURE",
            },
        });
    });

    it("returns 401 error for standard users", async () => {
        const newResource = {
            content_title: "fail-title",
            content_url: "http://www.fail.com",
            content_type: "Landing Page",
            rating: "PG",
        };

        const res = await request(app)
            .post("/resources")
            .send(newResource)
            .set("authorization", `Bearer ${u1Token}`);

        expect(res.statusCode).toEqual(401);
    });

    it("returns 401 error for anon users", async () => {
        const newResource = {
            content_title: "fail-title",
            content_url: "http://www.fail.com",
            content_type: "Landing Page",
            rating: "PG",
        };

        const res = await request(app).post("/resources").send(newResource);

        expect(res.statusCode).toEqual(401);
    });

    it("returns 400 error for invalid data inside object", async () => {
        const newResource = {
            content_title: true,
            content_url: "http://kbdfans.com",
            content_type: "Article",
            rating: "MATURE",
        };

        const res = await request(app)
            .post("/resources")
            .send(newResource)
            .set("authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(400);
    });

    it("returns 400 error for missing data inside object", async () => {
        const newResource = {
            content_title: "fail-title-2",
            content_url: "http://kbdfans.com",
            rating: "MATURE",
        };

        const res = await request(app)
            .post("/resources")
            .send(newResource)
            .set("authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(400);
    });

    it("returns 400 error for empty data object", async () => {
        const newResource = {};

        const res = await request(app)
            .post("/resources")
            .send(newResource)
            .set("authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(400);
    });
});

/************************************** GET /resources/:id */

describe('GET /resources/:id', () => {
    test('route works as expected for admin users', async () => {
        const res = await request(app).get('/resources/1').set('authorization', `Bearer ${adminToken}`);
        expect(res.status).toEqual(200);
        expect(res.body).toEqual({
            resource: {
                id: expect.any(Number),
                title: 'EPA Resources Page',
                url: expect.any(String),
                type: 'Landing Page',
                rating: "PG"
            }
        })
    })

    test('route works as expected for standard users', async () => {
        const res = await request(app).get('/resources/1').set('authorization', `Bearer ${u2Token}`);
        expect(res.status).toEqual(200);
        expect(res.body).toEqual({
            resource: {
                id: expect.any(Number),
                title: 'EPA Resources Page',
                url: expect.any(String),
                type: 'Landing Page',
                rating: "PG"
            }
        })
    })

    test('route works as expected for anon users', async () => {
        const res = await request(app).get('/resources/1');
        expect(res.status).toEqual(200);
        expect(res.body).toEqual({
            resource: {
                id: expect.any(Number),
                title: 'EPA Resources Page',
                url: expect.any(String),
                type: 'Landing Page',
                rating: "PG"
            }
        })
    })

    it('returns 404 for invalid id', async () => {
        const res = await request(app).get('/resources/1111');
        expect(res.status).toEqual(404);
    })
})

/************************************** PATCH /resources/:id */

describe("POST /resources/:id", () => {
    test("route works as expected for admin users", async () => {
        const data = {
            content_title: "update-me",
            content_url: "http://update.com",
            content_type: "Article",
            rating: "MATURE",
        };

        const target = await Resources.addNewResource({ ...data });

        const updates = {
            content_title: "updated-by-admin",
            content_url: "http://updated.com",
            content_type: "Video",
            rating: "PG",
        };

        const res = await request(app)
            .patch(`/resources/${target.id}`)
            .send(updates)
            .set(`authorization`, `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
    });

    it("returns 401 error for standard users", async () => {
        const data = {
            content_title: "update-failure",
            content_url: "http://nope.com",
            content_type: "Article",
            rating: "MATURE",
        };

        const target = await Resources.addNewResource({ ...data });

        const updates = {
            content_title: "updated-by-admin",
            content_url: "http://updated.com",
            content_type: "Video",
            rating: "PG",
        };

        const res = await request(app)
            .patch(`/resources/${target.id}`)
            .send(updates)
            .set(`authorization`, `Bearer ${u1Token}`);

        expect(res.statusCode).toEqual(401);
    });

    it("returns 401 error for anon users", async () => {
        const data = {
            content_title: "update-failure-2",
            content_url: "http://nope2.com",
            content_type: "Article",
            rating: "MATURE",
        };

        const target = await Resources.addNewResource({ ...data });

        const updates = {
            content_title: "updated-by-admin",
            content_url: "http://updated.com",
            content_type: "Video",
            rating: "PG",
        };

        const res = await request(app)
            .patch(`/resources/${target.id}`)
            .send(updates);

        expect(res.statusCode).toEqual(401);
    });

    it("returns 404 error for invalid id", async () => {
        const updates = {
            content_title: "updated-by-admin",
            content_url: "http://updated.com",
            content_type: "Video",
            rating: "PG",
        };

        const res = await request(app)
            .patch(`/resources/999`)
            .send(updates)
            .set(`authorization`, `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(404);
    });

    it("returns 400 error for invalid information in update object", async () => {
        const data = {
            content_title: "update-me",
            content_url: "http://update.com",
            content_type: "Article",
            rating: "MATURE",
        };

        const target = await Resources.addNewResource({ ...data });

        const updates = {
            content_title: "updated-by-admin",
            content_url: 1234,
            content_type: "Video",
            rating: "PG",
        };

        const res = await request(app)
            .patch(`/resources/${target.id}`)
            .send(updates)
            .set(`authorization`, `Bearer ${adminToken}`);
        expect(res.status).toEqual(400);
    });

    it("returns 400 error for missing information in update object", async () => {
        const data = {
            content_title: "update-me",
            content_url: "http://update.com",
            content_type: "Article",
            rating: "MATURE",
        };

        const target = await Resources.addNewResource({ ...data });

        const updates = {
            content_title: "updated-by-admin",
            content_url: "http://updated.com",
        };

        const res = await request(app)
            .patch(`/resources/${target.id}`)
            .send(updates)
            .set(`authorization`, `Bearer ${adminToken}`);
        expect(res.status).toEqual(400);
    });

    it("returns 400 error for empty update object", async () => {
        const data = {
            content_title: "update-me",
            content_url: "http://update.com",
            content_type: "Article",
            rating: "MATURE",
        };

        const target = await Resources.addNewResource({ ...data });

        const updates = {};

        const res = await request(app)
            .patch(`/resources/${target.id}`)
            .send(updates)
            .set(`authorization`, `Bearer ${adminToken}`);
        expect(res.status).toEqual(400);
    });
});

/************************************** DELETE /resources/:id */

describe('DELETE /resources/:id', () => {
    test('route works as expected for admin users', async () => {
        const res = await request(app).delete('/resources/4').set('authorization', `Bearer ${adminToken}`);

        expect(res.status).toEqual(200);
        expect(res.body).toEqual({
            deleted: "4"
        });
    })

    it('returns 401 error for standard users', async () => {
        const res = await request(app).delete('/resources/4').set('authorization', `Bearer ${u1Token}`);
        expect(res.status).toEqual(401)
    })

    it('returns 401 error for anon users', async () => {
        const res = await request(app).delete('/resources/4');
        expect(res.status).toEqual(401)
    })

    it('returns 404 for invalid resource id', async () => {
        const res = await request(app).delete('/resources/4444').set('authorization', `Bearer ${adminToken}`);
        expect(res.status).toEqual(404);
    })

    it('returns 404 if id has already been deleted', async () => {
        await request(app).delete('/resources/4').set('authorization', `Bearer ${adminToken}`);
        const res = await request(app).delete('/resources/4').set('authorization', `Bearer ${adminToken}`);
        expect(res.status).toEqual(404);
    })
})

/************************************** GET /resources/articles */

describe('GET /resources/articles', () => {
    test('route works as expected for admin users', async () => {
        const res = await request(app).get('/resources/articles').set('authorization', `Bearer ${adminToken}`);
        expect(res.status).toEqual(200);
        expect(res.body).toEqual({
            articles: [
                {
                    id: 16,
                    title: 'Tornadoes and Climate Change',
                    URL: 'https://tinyurl.com/57ymcjpy',
                    type: 'Article',
                    rating: 'PG'
                },
                {
                    id: 18,
                    title: 'How Climate Change Impacts Water Access',
                    URL: 'https://tinyurl.com/bddzdzjb',
                    type: 'Article',
                    rating: 'PG'
                },
                {
                    id: 19,
                    title: 'Unbalanced: How Climate Change Is Shifting Earth’s Ecosystems',
                    URL: 'https://tinyurl.com/hn2c8cfv',
                    type: 'Article',
                    rating: 'PG'
                },
                {
                    id: 21,
                    title: 'The Influence of Climate Change on Extreme Environmental Events',
                    URL: 'https://tinyurl.com/25sudcpe',
                    type: 'Article',
                    rating: 'PG'
                },
                {
                    id: 23,
                    title: 'Earths Changing Climate',
                    URL: 'https://tinyurl.com/2fc5xtbu',
                    type: 'Article',
                    rating: 'PG-13'
                },
                {
                    id: 24,
                    title: 'Climate Refugees',
                    URL: 'https://tinyurl.com/zh2jsxut',
                    type: 'Article',
                    rating: 'PG-13'
                },
                {
                    id: 27,
                    title: 'NASA Climate Kids - What is Climate Change?',
                    URL: 'https://tinyurl.com/7jpmemsx',
                    type: 'Article',
                    rating: 'PG'
                },
                {
                    id: 28,
                    title: 'United Nations - What Is Climate Change?',
                    URL: 'https://tinyurl.com/53jt6wu3',
                    type: 'Article',
                    rating: 'PG'
                },
                {
                    id: 29,
                    title: 'NASA - What is Climate Change?',
                    URL: 'https://tinyurl.com/tfxnszr6',
                    type: 'Article',
                    rating: 'PG'
                }
            ]
        })
    })

    test('route works as expected for standard users', async () => {
        const res = await request(app).get('/resources/articles').set('authorization', `Bearer ${u2Token}`);

        expect(res.status).toEqual(200);
        expect(res.body).toEqual({
            articles: [
                {
                    id: 16,
                    title: 'Tornadoes and Climate Change',
                    URL: 'https://tinyurl.com/57ymcjpy',
                    type: 'Article',
                    rating: 'PG'
                },
                {
                    id: 18,
                    title: 'How Climate Change Impacts Water Access',
                    URL: 'https://tinyurl.com/bddzdzjb',
                    type: 'Article',
                    rating: 'PG'
                },
                {
                    id: 19,
                    title: 'Unbalanced: How Climate Change Is Shifting Earth’s Ecosystems',
                    URL: 'https://tinyurl.com/hn2c8cfv',
                    type: 'Article',
                    rating: 'PG'
                },
                {
                    id: 21,
                    title: 'The Influence of Climate Change on Extreme Environmental Events',
                    URL: 'https://tinyurl.com/25sudcpe',
                    type: 'Article',
                    rating: 'PG'
                },
                {
                    id: 23,
                    title: 'Earths Changing Climate',
                    URL: 'https://tinyurl.com/2fc5xtbu',
                    type: 'Article',
                    rating: 'PG-13'
                },
                {
                    id: 24,
                    title: 'Climate Refugees',
                    URL: 'https://tinyurl.com/zh2jsxut',
                    type: 'Article',
                    rating: 'PG-13'
                },
                {
                    id: 27,
                    title: 'NASA Climate Kids - What is Climate Change?',
                    URL: 'https://tinyurl.com/7jpmemsx',
                    type: 'Article',
                    rating: 'PG'
                },
                {
                    id: 28,
                    title: 'United Nations - What Is Climate Change?',
                    URL: 'https://tinyurl.com/53jt6wu3',
                    type: 'Article',
                    rating: 'PG'
                },
                {
                    id: 29,
                    title: 'NASA - What is Climate Change?',
                    URL: 'https://tinyurl.com/tfxnszr6',
                    type: 'Article',
                    rating: 'PG'
                }
            ]
        })
    })

    test('route works as expected for anon users', async () => {
        const res = await request(app).get('/resources/articles')
        expect(res.status).toEqual(200);
        expect(res.body).toEqual({
            articles: [
                {
                    id: 16,
                    title: 'Tornadoes and Climate Change',
                    URL: 'https://tinyurl.com/57ymcjpy',
                    type: 'Article',
                    rating: 'PG'
                },
                {
                    id: 18,
                    title: 'How Climate Change Impacts Water Access',
                    URL: 'https://tinyurl.com/bddzdzjb',
                    type: 'Article',
                    rating: 'PG'
                },
                {
                    id: 19,
                    title: 'Unbalanced: How Climate Change Is Shifting Earth’s Ecosystems',
                    URL: 'https://tinyurl.com/hn2c8cfv',
                    type: 'Article',
                    rating: 'PG'
                },
                {
                    id: 21,
                    title: 'The Influence of Climate Change on Extreme Environmental Events',
                    URL: 'https://tinyurl.com/25sudcpe',
                    type: 'Article',
                    rating: 'PG'
                },
                {
                    id: 23,
                    title: 'Earths Changing Climate',
                    URL: 'https://tinyurl.com/2fc5xtbu',
                    type: 'Article',
                    rating: 'PG-13'
                },
                {
                    id: 24,
                    title: 'Climate Refugees',
                    URL: 'https://tinyurl.com/zh2jsxut',
                    type: 'Article',
                    rating: 'PG-13'
                },
                {
                    id: 27,
                    title: 'NASA Climate Kids - What is Climate Change?',
                    URL: 'https://tinyurl.com/7jpmemsx',
                    type: 'Article',
                    rating: 'PG'
                },
                {
                    id: 28,
                    title: 'United Nations - What Is Climate Change?',
                    URL: 'https://tinyurl.com/53jt6wu3',
                    type: 'Article',
                    rating: 'PG'
                },
                {
                    id: 29,
                    title: 'NASA - What is Climate Change?',
                    URL: 'https://tinyurl.com/tfxnszr6',
                    type: 'Article',
                    rating: 'PG'
                }
            ]
        })
    })
})

/************************************** GET /resources/videos */
describe('GET /resources/videos', () => {
    test('route works as expected for admin users', async () => {
        const res = await request(app).get('/resources/videos').set('authorization', `Bearer ${adminToken}`);

        expect(res.status).toEqual(200);
        expect(res.body).toEqual({
            videos: [
                {
                    id: 6,
                    title: 'Video: Global Warming from 1880 to 2021',
                    URL: 'https://tinyurl.com/5ycu679m',
                    type: 'Video',
                    rating: 'PG'
                },
                {
                    id: 7,
                    title: 'I Live in the Eastern US - Does Climate Change Matter to Me?',
                    URL: 'https://tinyurl.com/bd2bpb35',
                    type: 'Video',
                    rating: 'PG'
                },
                {
                    id: 8,
                    title: 'Southern Great Plains & Southwest | Global Weirding',
                    URL: 'https://tinyurl.com/yc6yytn5',
                    type: 'Video',
                    rating: 'PG'
                },
                {
                    id: 9,
                    title: 'Whats the Big Deal With a Few Degrees?',
                    URL: 'https://tinyurl.com/2n9dpu8d',
                    type: 'Video',
                    rating: 'PG'
                },
                {
                    id: 10,
                    title: 'Paris Agreement: Last Week Tonight with John Oliver (HBO)',
                    URL: 'https://tinyurl.com/e67r2u4e',
                    type: 'Video',
                    rating: 'MATURE'
                },
                {
                    id: 11,
                    title: 'Green New Deal: Last Week Tonight with John Oliver (HBO)',
                    URL: 'https://tinyurl.com/5n7bc6w5',
                    type: 'Video',
                    rating: 'MATURE'
                },
                {
                    id: 12,
                    title: 'We WILL Fix Climate Change!',
                    URL: 'https://tinyurl.com/2k9aw4wv',
                    type: 'Video',
                    rating: 'PG-13'
                },
                {
                    id: 13,
                    title: 'Do we Need Nuclear Energy to Stop Climate Change?',
                    URL: 'https://tinyurl.com/2n73uk43',
                    type: 'Video',
                    rating: 'PG-13'
                },
                {
                    id: 14,
                    title: 'Plastic Pollution: How Humans are Turning the World into Plastic',
                    URL: 'https://tinyurl.com/3mk6n5be',
                    type: 'Video',
                    rating: 'PG-13'
                },
                {
                    id: 15,
                    title: 'Can YOU Fix Climate Change?',
                    URL: 'https://tinyurl.com/4a73svj4',
                    type: 'Video',
                    rating: 'PG-13'
                },
                {
                    id: 17,
                    title: 'Global Climate Change - Through the Lens of Changing Glaciers',
                    URL: 'https://tinyurl.com/68ajfkat',
                    type: 'Video',
                    rating: 'PG'
                },
                {
                    id: 20,
                    title: 'Ocean Impacts of Climate Change',
                    URL: 'https://tinyurl.com/25jas9vn',
                    type: 'Video',
                    rating: 'PG'
                },
                {
                    id: 22,
                    title: 'Amazon Deforestation and Climate Change',
                    URL: 'https://tinyurl.com/2brx78vz',
                    type: 'Video',
                    rating: 'PG-13'
                },
                {
                    id: 25,
                    title: 'Climate 101: Cause and Effect',
                    URL: 'https://tinyurl.com/p6zshcsc',
                    type: 'Video',
                    rating: 'PG'
                },
                {
                    id: 26,
                    title: 'Assessing Drought in the United States',
                    URL: 'https://tinyurl.com/z23fdjtf',
                    type: 'Video',
                    rating: 'PG'
                },
                {
                    id: 30,
                    title: 'Is It Too Late To Stop Climate Change? Well, its Complicated.',
                    URL: 'https://tinyurl.com/2p8mj7uk',
                    type: 'Video',
                    rating: 'PG-13'
                }
            ]
        })
    })

    test('route works as expected for standard users', async () => {
        const res = await request(app).get('/resources/videos').set('authorization', `Bearer ${u2Token}`);

        expect(res.status).toEqual(200);
        expect(res.body).toEqual({
            videos: [
                {
                    id: 6,
                    title: 'Video: Global Warming from 1880 to 2021',
                    URL: 'https://tinyurl.com/5ycu679m',
                    type: 'Video',
                    rating: 'PG'
                },
                {
                    id: 7,
                    title: 'I Live in the Eastern US - Does Climate Change Matter to Me?',
                    URL: 'https://tinyurl.com/bd2bpb35',
                    type: 'Video',
                    rating: 'PG'
                },
                {
                    id: 8,
                    title: 'Southern Great Plains & Southwest | Global Weirding',
                    URL: 'https://tinyurl.com/yc6yytn5',
                    type: 'Video',
                    rating: 'PG'
                },
                {
                    id: 9,
                    title: 'Whats the Big Deal With a Few Degrees?',
                    URL: 'https://tinyurl.com/2n9dpu8d',
                    type: 'Video',
                    rating: 'PG'
                },
                {
                    id: 10,
                    title: 'Paris Agreement: Last Week Tonight with John Oliver (HBO)',
                    URL: 'https://tinyurl.com/e67r2u4e',
                    type: 'Video',
                    rating: 'MATURE'
                },
                {
                    id: 11,
                    title: 'Green New Deal: Last Week Tonight with John Oliver (HBO)',
                    URL: 'https://tinyurl.com/5n7bc6w5',
                    type: 'Video',
                    rating: 'MATURE'
                },
                {
                    id: 12,
                    title: 'We WILL Fix Climate Change!',
                    URL: 'https://tinyurl.com/2k9aw4wv',
                    type: 'Video',
                    rating: 'PG-13'
                },
                {
                    id: 13,
                    title: 'Do we Need Nuclear Energy to Stop Climate Change?',
                    URL: 'https://tinyurl.com/2n73uk43',
                    type: 'Video',
                    rating: 'PG-13'
                },
                {
                    id: 14,
                    title: 'Plastic Pollution: How Humans are Turning the World into Plastic',
                    URL: 'https://tinyurl.com/3mk6n5be',
                    type: 'Video',
                    rating: 'PG-13'
                },
                {
                    id: 15,
                    title: 'Can YOU Fix Climate Change?',
                    URL: 'https://tinyurl.com/4a73svj4',
                    type: 'Video',
                    rating: 'PG-13'
                },
                {
                    id: 17,
                    title: 'Global Climate Change - Through the Lens of Changing Glaciers',
                    URL: 'https://tinyurl.com/68ajfkat',
                    type: 'Video',
                    rating: 'PG'
                },
                {
                    id: 20,
                    title: 'Ocean Impacts of Climate Change',
                    URL: 'https://tinyurl.com/25jas9vn',
                    type: 'Video',
                    rating: 'PG'
                },
                {
                    id: 22,
                    title: 'Amazon Deforestation and Climate Change',
                    URL: 'https://tinyurl.com/2brx78vz',
                    type: 'Video',
                    rating: 'PG-13'
                },
                {
                    id: 25,
                    title: 'Climate 101: Cause and Effect',
                    URL: 'https://tinyurl.com/p6zshcsc',
                    type: 'Video',
                    rating: 'PG'
                },
                {
                    id: 26,
                    title: 'Assessing Drought in the United States',
                    URL: 'https://tinyurl.com/z23fdjtf',
                    type: 'Video',
                    rating: 'PG'
                },
                {
                    id: 30,
                    title: 'Is It Too Late To Stop Climate Change? Well, its Complicated.',
                    URL: 'https://tinyurl.com/2p8mj7uk',
                    type: 'Video',
                    rating: 'PG-13'
                }
            ]
        })
    })

    test('route works as expected for anon users', async () => {
        const res = await request(app).get('/resources/videos')

        expect(res.status).toEqual(200);
        expect(res.body).toEqual({
            videos: [
                {
                    id: 6,
                    title: 'Video: Global Warming from 1880 to 2021',
                    URL: 'https://tinyurl.com/5ycu679m',
                    type: 'Video',
                    rating: 'PG'
                },
                {
                    id: 7,
                    title: 'I Live in the Eastern US - Does Climate Change Matter to Me?',
                    URL: 'https://tinyurl.com/bd2bpb35',
                    type: 'Video',
                    rating: 'PG'
                },
                {
                    id: 8,
                    title: 'Southern Great Plains & Southwest | Global Weirding',
                    URL: 'https://tinyurl.com/yc6yytn5',
                    type: 'Video',
                    rating: 'PG'
                },
                {
                    id: 9,
                    title: 'Whats the Big Deal With a Few Degrees?',
                    URL: 'https://tinyurl.com/2n9dpu8d',
                    type: 'Video',
                    rating: 'PG'
                },
                {
                    id: 10,
                    title: 'Paris Agreement: Last Week Tonight with John Oliver (HBO)',
                    URL: 'https://tinyurl.com/e67r2u4e',
                    type: 'Video',
                    rating: 'MATURE'
                },
                {
                    id: 11,
                    title: 'Green New Deal: Last Week Tonight with John Oliver (HBO)',
                    URL: 'https://tinyurl.com/5n7bc6w5',
                    type: 'Video',
                    rating: 'MATURE'
                },
                {
                    id: 12,
                    title: 'We WILL Fix Climate Change!',
                    URL: 'https://tinyurl.com/2k9aw4wv',
                    type: 'Video',
                    rating: 'PG-13'
                },
                {
                    id: 13,
                    title: 'Do we Need Nuclear Energy to Stop Climate Change?',
                    URL: 'https://tinyurl.com/2n73uk43',
                    type: 'Video',
                    rating: 'PG-13'
                },
                {
                    id: 14,
                    title: 'Plastic Pollution: How Humans are Turning the World into Plastic',
                    URL: 'https://tinyurl.com/3mk6n5be',
                    type: 'Video',
                    rating: 'PG-13'
                },
                {
                    id: 15,
                    title: 'Can YOU Fix Climate Change?',
                    URL: 'https://tinyurl.com/4a73svj4',
                    type: 'Video',
                    rating: 'PG-13'
                },
                {
                    id: 17,
                    title: 'Global Climate Change - Through the Lens of Changing Glaciers',
                    URL: 'https://tinyurl.com/68ajfkat',
                    type: 'Video',
                    rating: 'PG'
                },
                {
                    id: 20,
                    title: 'Ocean Impacts of Climate Change',
                    URL: 'https://tinyurl.com/25jas9vn',
                    type: 'Video',
                    rating: 'PG'
                },
                {
                    id: 22,
                    title: 'Amazon Deforestation and Climate Change',
                    URL: 'https://tinyurl.com/2brx78vz',
                    type: 'Video',
                    rating: 'PG-13'
                },
                {
                    id: 25,
                    title: 'Climate 101: Cause and Effect',
                    URL: 'https://tinyurl.com/p6zshcsc',
                    type: 'Video',
                    rating: 'PG'
                },
                {
                    id: 26,
                    title: 'Assessing Drought in the United States',
                    URL: 'https://tinyurl.com/z23fdjtf',
                    type: 'Video',
                    rating: 'PG'
                },
                {
                    id: 30,
                    title: 'Is It Too Late To Stop Climate Change? Well, its Complicated.',
                    URL: 'https://tinyurl.com/2p8mj7uk',
                    type: 'Video',
                    rating: 'PG-13'
                }
            ]
        })
    })
})

/************************************** GET /resources/additional-resources */

describe('GET /resources/additional-resources', () => {
    test('route works as expected for admin users', async () => {
        const res = await request(app).get('/resources/additional-resources').set('authorization', `Bearer ${adminToken}`);

        expect(res.status).toEqual(200);
        expect(res.body).toEqual({
            landingPages: [
                {
                    id: 1,
                    title: 'EPA Resources Page',
                    URL: 'https://tinyurl.com/ymepb2bt',
                    type: 'Landing Page',
                    rating: 'PG'
                },
                {
                    id: 2,
                    title: 'NASA Climate Change Landing Page',
                    URL: 'https://tinyurl.com/pj2hb5pu',
                    type: 'Landing Page',
                    rating: 'PG'
                },
                {
                    id: 3,
                    title: 'NASA Climate Change - For Kids',
                    URL: 'https://tinyurl.com/243axk4h',
                    type: 'Landing Page',
                    rating: 'PG'
                },
                {
                    id: 4,
                    title: 'NASA Climate Change - For Teachers',
                    URL: 'https://tinyurl.com/yyam4atk',
                    type: 'Landing Page',
                    rating: 'PG'
                },
                {
                    id: 5,
                    title: 'National Geographic - Climate Change',
                    URL: 'https://tinyurl.com/yhub9j9u',
                    type: 'Landing Page',
                    rating: 'PG'
                }
            ]
        })
    })

    test('route works as expected for standard users', async () => {
        const res = await request(app).get('/resources/additional-resources').set('authorization', `Bearer ${u2Token}`);

        expect(res.status).toEqual(200);
        expect(res.body).toEqual({
            landingPages: [
                {
                    id: 1,
                    title: 'EPA Resources Page',
                    URL: 'https://tinyurl.com/ymepb2bt',
                    type: 'Landing Page',
                    rating: 'PG'
                },
                {
                    id: 2,
                    title: 'NASA Climate Change Landing Page',
                    URL: 'https://tinyurl.com/pj2hb5pu',
                    type: 'Landing Page',
                    rating: 'PG'
                },
                {
                    id: 3,
                    title: 'NASA Climate Change - For Kids',
                    URL: 'https://tinyurl.com/243axk4h',
                    type: 'Landing Page',
                    rating: 'PG'
                },
                {
                    id: 4,
                    title: 'NASA Climate Change - For Teachers',
                    URL: 'https://tinyurl.com/yyam4atk',
                    type: 'Landing Page',
                    rating: 'PG'
                },
                {
                    id: 5,
                    title: 'National Geographic - Climate Change',
                    URL: 'https://tinyurl.com/yhub9j9u',
                    type: 'Landing Page',
                    rating: 'PG'
                }
            ]
        })
    })

    test('route works as expected for anon users', async () => {
        const res = await request(app).get('/resources/additional-resources')

        expect(res.status).toEqual(200);
        expect(res.body).toEqual({
            landingPages: [
                {
                    id: 1,
                    title: 'EPA Resources Page',
                    URL: 'https://tinyurl.com/ymepb2bt',
                    type: 'Landing Page',
                    rating: 'PG'
                },
                {
                    id: 2,
                    title: 'NASA Climate Change Landing Page',
                    URL: 'https://tinyurl.com/pj2hb5pu',
                    type: 'Landing Page',
                    rating: 'PG'
                },
                {
                    id: 3,
                    title: 'NASA Climate Change - For Kids',
                    URL: 'https://tinyurl.com/243axk4h',
                    type: 'Landing Page',
                    rating: 'PG'
                },
                {
                    id: 4,
                    title: 'NASA Climate Change - For Teachers',
                    URL: 'https://tinyurl.com/yyam4atk',
                    type: 'Landing Page',
                    rating: 'PG'
                },
                {
                    id: 5,
                    title: 'National Geographic - Climate Change',
                    URL: 'https://tinyurl.com/yhub9j9u',
                    type: 'Landing Page',
                    rating: 'PG'
                }
            ]
        })
    })
})