-- Table pour le covoiturage des événements (alignée sur EventCarpool)
CREATE TABLE IF NOT EXISTS event_carpools (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind VARCHAR(10) NOT NULL CHECK (kind IN ('offer', 'seek')),
  departure_area VARCHAR(255) NOT NULL,
  seats_offered INTEGER NULL,
  comment TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_event_carpools_event_user_kind
  ON event_carpools(event_id, user_id, kind);
