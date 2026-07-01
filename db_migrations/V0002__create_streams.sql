CREATE TABLE IF NOT EXISTS streams (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    teams VARCHAR(255),
    is_live BOOLEAN NOT NULL DEFAULT false,
    scheduled_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);