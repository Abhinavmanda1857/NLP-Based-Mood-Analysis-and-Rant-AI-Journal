CREATE TABLE journal_entries (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(50) NOT NULL,
  sentiment VARCHAR(50)
);