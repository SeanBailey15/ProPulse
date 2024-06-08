CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(40) UNIQUE NOT NULL CHECK (email = lower(email) AND position('@' IN email) > 1),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    password TEXT NOT NULL,
    organization TEXT NOT NULL,
    title TEXT NOT NULL
);

CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT,
    state TEXT,
    street_addr TEXT,
    admin INTEGER REFERENCES users(id) NOT NULL
);

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    date_posted TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    posted_by INTEGER REFERENCES users(id) NOT NULL,
    job_id INTEGER REFERENCES jobs(id) NOT NULL,
    deadline TIMESTAMPTZ DEFAULT NULL,
    progress TEXT DEFAULT NULL,
    urgency TEXT DEFAULT NULL,
    content TEXT NOT NULL,
    tagged INTEGER[],
    is_reply BOOLEAN DEFAULT FALSE
);

CREATE TABLE post_tagged_users (
    post_id INTEGER REFERENCES posts(id) NOT NULL,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    PRIMARY KEY (post_id, user_id)
);

CREATE TABLE replies (
    id SERIAL PRIMARY KEY,
    date_posted TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    posted_by INTEGER REFERENCES users(id) NOT NULL,
    reply_to INTEGER REFERENCES posts(id) NOT NULL,
    deadline TIMESTAMPTZ DEFAULT NULL,
    content TEXT NOT NULL,
    tagged INTEGER[] DEFAULT NULL,
    is_reply BOOLEAN DEFAULT TRUE
);

CREATE TABLE reply_tagged_users (
    reply_id INTEGER REFERENCES replies(id) NOT NULL,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    PRIMARY KEY (reply_id, user_id)
);

CREATE TABLE images (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    posted_by INTEGER REFERENCES users(id) NOT NULL,
    post_id INTEGER REFERENCES posts(id) NOT NULL,
    job_id INTEGER REFERENCES jobs(id) NOT NULL
);

CREATE TABLE job_associations (
    job_id INTEGER REFERENCES jobs(id) NOT NULL,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    PRIMARY KEY (job_id, user_id)
);

CREATE TABLE job_privileges (
    job_id INTEGER REFERENCES jobs(id) NOT NULL,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    PRIMARY KEY (job_id, user_id)
);
