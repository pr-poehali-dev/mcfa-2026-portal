CREATE TABLE IF NOT EXISTS applicants (
    id SERIAL PRIMARY KEY,
    nick VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    role_wish TEXT,
    skin_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    tag VARCHAR(50),
    body TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applicants_status ON applicants(status);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);