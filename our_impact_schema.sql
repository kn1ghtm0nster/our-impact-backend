DROP DATABASE our_impact_db;
CREATE DATABASE our_impact_db;

-- DROP DATABASE our_impact_db_test;
-- CREATE DATABASE our_impact_db_test;

\c our_impact_db
-- \c our_impact_db_test

CREATE TABLE cities(
    city_name TEXT PRIMARY KEY,
    country_code TEXT NOT NULL,
    lattitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL
);

CREATE TABLE users(
    username VARCHAR(25) PRIMARY KEY,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL
        CHECK (position('@' IN email) > 1),
    city_name TEXT
        REFERENCES cities ON DELETE CASCADE,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE comments(
    comment_id SERIAL PRIMARY KEY,
    comment_text TEXT NOT NULL,
    username VARCHAR(25)
        REFERENCES users ON DELETE CASCADE,
    city_name TEXT
        REFERENCES cities ON DELETE CASCADE,
    likes INTEGER DEFAULT 0
);

CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    comment_id INTEGER
        REFERENCES comments ON DELETE CASCADE,
    username VARCHAR(25)
        REFERENCES users ON DELETE CASCADE,
    from_username VARCHAR(25)
        REFERENCES users ON DELETE CASCADE
);

CREATE TABLE resources (
    resource_id SERIAL PRIMARY KEY,
    content_title VARCHAR(700),
    content_url TEXT NOT NULL,
    content_type TEXT NOT NULL,
    rating TEXT NOT NULL
);

CREATE TABLE temp_data (
    id SERIAL PRIMARY KEY,
    date_added TIMESTAMP NOT NULL DEFAULT now(),
    city TEXT NOT NULL REFERENCES cities(city_name) ON DELETE CASCADE,
    curr_temp_cel FLOAT NOT NULL,
    curr_temp_far FLOAT NOT NULL,
    min_temp_cel FLOAT NOT NULL,
    max_temp_cel FLOAT NOT NULL,
    max_temp_far FLOAT NOT NULL,
    min_temp_far FLOAT NOT NULL,
    air_quality FLOAT NOT NULL
);



-- INSERTING INTO REROUCES TABLE
INSERT INTO resources (content_title, content_url, content_type, rating)
VALUES 
(
    'EPA Resources Page',
    'https://tinyurl.com/ymepb2bt',
    'Landing Page',
    'PG'
),
(
    'NASA Climate Change Landing Page',
    'https://tinyurl.com/pj2hb5pu',
    'Landing Page',
    'PG'
),
(
    'NASA Climate Change - For Kids',
    'https://tinyurl.com/243axk4h',
    'Landing Page',
    'PG'
),
(
    'NASA Climate Change - For Teachers',
    'https://tinyurl.com/yyam4atk',
    'Landing Page',
    'PG'
),
(
    'National Geographic - Climate Change',
    'https://tinyurl.com/yhub9j9u',
    'Landing Page',
    'PG'
),
(
    'Video: Global Warming from 1880 to 2021',
    'https://tinyurl.com/5ycu679m',
    'Video',
    'PG'
),
(
    'I Live in the Eastern US - Does Climate Change Matter to Me?',
    'https://tinyurl.com/bd2bpb35',
    'Video',
    'PG'
),
(
    'Southern Great Plains & Southwest | Global Weirding',
    'https://tinyurl.com/yc6yytn5',
    'Video',
    'PG'
),
(
    'Whats the Big Deal With a Few Degrees?',
    'https://tinyurl.com/2n9dpu8d',
    'Video',
    'PG'
),
(
    'Paris Agreement: Last Week Tonight with John Oliver (HBO)',
    'https://tinyurl.com/e67r2u4e',
    'Video',
    'MATURE'
),
(
    'Green New Deal: Last Week Tonight with John Oliver (HBO)',
    'https://tinyurl.com/5n7bc6w5',
    'Video',
    'MATURE'
),
(
    'We WILL Fix Climate Change!',
    'https://tinyurl.com/2k9aw4wv',
    'Video',
    'PG-13'
),
(
    'Do we Need Nuclear Energy to Stop Climate Change?',
    'https://tinyurl.com/2n73uk43',
    'Video',
    'PG-13'
),
(
    'Plastic Pollution: How Humans are Turning the World into Plastic',
    'https://tinyurl.com/3mk6n5be',
    'Video',
    'PG-13'
),
(
    'Can YOU Fix Climate Change?',
    'https://tinyurl.com/4a73svj4',
    'Video',
    'PG-13'
),
(
    'Tornadoes and Climate Change',
    'https://tinyurl.com/57ymcjpy',
    'Article',
    'PG'
),
(
    'Global Climate Change - Through the Lens of Changing Glaciers',
    'https://tinyurl.com/68ajfkat',
    'Video',
    'PG'
),
(
    'How Climate Change Impacts Water Access',
    'https://tinyurl.com/bddzdzjb',
    'Article',
    'PG'
),
(
    'Unbalanced: How Climate Change Is Shifting Earth’s Ecosystems',
    'https://tinyurl.com/hn2c8cfv',
    'Article',
    'PG'
),
(
    'Ocean Impacts of Climate Change',
    'https://tinyurl.com/25jas9vn',
    'Video',
    'PG'
),
(
    'The Influence of Climate Change on Extreme Environmental Events',
    'https://tinyurl.com/25sudcpe',
    'Article',
    'PG'
),
(
    'Amazon Deforestation and Climate Change',
    'https://tinyurl.com/2brx78vz',
    'Video',
    'PG-13'
),
(
    'Earths Changing Climate',
    'https://tinyurl.com/2fc5xtbu',
    'Article',
    'PG-13'
),
(
    'Climate Refugees',
    'https://tinyurl.com/zh2jsxut',
    'Article',
    'PG-13'
),
(
    'Climate 101: Cause and Effect',
    'https://tinyurl.com/p6zshcsc',
    'Video',
    'PG'
),
(
    'Assessing Drought in the United States',
    'https://tinyurl.com/z23fdjtf',
    'Video',
    'PG'
),
(
    'NASA Climate Kids - What is Climate Change?',
    'https://tinyurl.com/7jpmemsx',
    'Article',
    'PG'
),
(
    'United Nations - What Is Climate Change?',
    'https://tinyurl.com/53jt6wu3',
    'Article',
    'PG'
),
(
    'NASA - What is Climate Change?',
    'https://tinyurl.com/tfxnszr6',
    'Article',
    'PG'
),
(
    'Is It Too Late To Stop Climate Change? Well, its Complicated.',
    'https://tinyurl.com/2p8mj7uk',
    'Video',
    'PG-13'
);

-- INSERTING CITIES TABLE

INSERT INTO cities (city_name, country_code, lattitude, longitude)
VALUES (
    'Paris',
    'FR',
    48.8588897,
    2.3200410217200766
),
(
    'Toulouse',
    'FR',
    43.6044622,
    1.4442469
),
(
    'London',
    'GB',
    51.5073219,
    -0.1276474
),
(
    'Inverness',
    'GB',
    57.4790124,
    -4.225739
),
(
    'Beijing',
    'CN',
    39.906217,
    116.3912757
),
(
    'Xinxiang',
    'CN',
    35.3021133,
    113.9202062
),
(
    'Tokyo',
    'JP',
    35.6828387,
    139.7594549
),
(
    'Kyoto',
    'JP',
    35.021041,
    135.7556075
),
(
    'Toronto',
    'CA',
    43.6534817,
    -79.3839347
),
(
    'Vancouver',
    'CA',
    49.2608724,
    -123.113952
),
(
    'Dallas',
    'US',
    32.7762719,
    -96.7968559
),
(
    'New Orleans',
    'US',
    29.9759983,
    -90.0782127
),
(
    'Berlin',
    'DE',
    52.5170365,
    13.3888599
),
(
    'Frankfurt',
    'DE',
    50.1106444,
    8.6820917
),
(
    'Delhi',
    'IN',
    28.6517178,
    77.2219388
),
(
    'Hapur',
    'IN',
    28.7299677,
    77.775499
),
(
    'Mexico City',
    'MX',
    19.4326296,
    -99.1331785
),
(
    'Aguascalientes',
    'MX',
    21.880487,
    -102.2967195
),
(
    'Sydney',
    'AU',
    -33.8698439,
    151.2082848
),
(
    'Perth',
    'AU',
    -31.9558964,
    115.8605801
);

