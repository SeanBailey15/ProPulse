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
    admin INTEGER REFERENCES users(id)
);

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    date_posted TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    posted_by INTEGER REFERENCES users(id),
    job_id INTEGER REFERENCES jobs(id),
    deadline TIMESTAMPTZ DEFAULT NULL,
    progress TEXT DEFAULT NULL,
    urgency TEXT DEFAULT NULL,
    content TEXT NOT NULL
);

CREATE TABLE images (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    posted_by INTEGER REFERENCES users(id),
    post_id INTEGER REFERENCES posts(id),
    job_id INTEGER REFERENCES jobs(id)
);

CREATE TABLE post_tagged_users (
    post_id INTEGER REFERENCES posts(id),
    user_id INTEGER REFERENCES users(id),
    PRIMARY KEY (post_id, user_id)
);

CREATE TABLE job_associations (
    job_id INTEGER REFERENCES jobs(id),
    user_id INTEGER REFERENCES users(id),
    PRIMARY KEY (job_id, user_id)
);

CREATE TABLE job_privileges (
    job_id INTEGER REFERENCES jobs(id),
    user_id INTEGER REFERENCES users(id),
    PRIMARY KEY (job_id, user_id)
);
